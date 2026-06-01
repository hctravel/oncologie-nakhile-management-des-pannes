const { Maintenance, MedicalMachine, AuditLog, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Helper function to transform maintenance data for frontend
const transformMaintenanceData = (item) => {
  const data = item.toJSON ? item.toJSON() : item;
  return {
    ...data,
    startDate: data.maintenanceDate,
    endDate: data.completionDate || data.maintenanceDate,
    maintenanceDaysCount: data.workedDays && Array.isArray(data.workedDays) ? data.workedDays.length : 0,
  };
};

// Get all maintenances
exports.getAllMaintenances = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;

  let where = {};

  if (search) {
    where[Op.or] = [
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  const startIndex = (page - 1) * limit;

  const maintenances = await Maintenance.findAll({
    where,
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
    limit: limit * 1,
    offset: startIndex,
    order: [['createdAt', 'DESC']],
  });

  const total = await Maintenance.count({ where });

  await AuditLog.create({
    action: 'read',
    entityType: 'maintenance',
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed maintenance list`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    count: maintenances.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: { maintenance: maintenances.map(transformMaintenanceData) },
  });
});

// Get single maintenance
exports.getMaintenanceById = asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findByPk(req.params.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
  });

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance record not found',
    });
  }

  await AuditLog.create({
    action: 'read',
    entityType: 'maintenance',
    entityId: maintenance.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed maintenance details`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    data: transformMaintenanceData(maintenance),
  });
});

// Create maintenance
exports.createMaintenance = asyncHandler(async (req, res, next) => {
  const { machineId, maintenanceDate, type, description, cost, status, notes, panneId, technician, workedDays } = req.body;

  if (!machineId || !maintenanceDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide machineId and maintenanceDate',
    });
  }

  // Verify machine exists
  const machine = await MedicalMachine.findByPk(machineId);
  if (!machine) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found',
    });
  }

  const maintenance = await Maintenance.create({
    machineId,
    maintenanceDate: maintenanceDate,
    completionDate: workedDays && Array.isArray(workedDays) && workedDays.length > 0 ? workedDays[workedDays.length - 1] : null,
    workedDays: workedDays || [],
    type: type || 'preventive',
    description: description || '',
    cost: cost || 0,
    status: status || 'scheduled',
    notes: notes || '',
    panneId: panneId || null,
    technician: technician || '',
    recordedBy: req.user?.id ? Number(req.user.id) || null : null,
  });

  const populatedMaintenance = await Maintenance.findByPk(maintenance.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
  });

  await AuditLog.create({
    action: 'create',
    entityType: 'maintenance',
    entityId: maintenance.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Created maintenance for machine: ${machine.name}`,
    changes: JSON.stringify({
      after: {
        type: maintenance.type,
        machineId: maintenance.machineId,
        maintenanceDate: maintenance.maintenanceDate,
        workedDaysCount: (workedDays || []).length,
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').emit('maintenance_created', {
    maintenanceId: maintenance.id,
    machineId: maintenance.machineId,
  });

  res.status(201).json({
    success: true,
    message: 'Maintenance record created successfully',
    data: transformMaintenanceData(populatedMaintenance),
  });
});

// Update maintenance
exports.updateMaintenance = asyncHandler(async (req, res, next) => {
  const { technician, maintenanceDate, type, description, cost, status, completionDate, notes, workedDays } = req.body;

  let maintenance = await Maintenance.findByPk(req.params.id);

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance record not found',
    });
  }

  const oldValues = {
    status: maintenance.status,
    type: maintenance.type,
    cost: maintenance.cost,
  };

  if (technician) maintenance.technician = technician;
  if (maintenanceDate) maintenance.maintenanceDate = maintenanceDate;
  if (type) maintenance.type = type;
  if (description) maintenance.description = description;
  if (cost !== undefined) maintenance.cost = cost;
  if (status) maintenance.status = status;
  if (completionDate) maintenance.completionDate = completionDate;
  if (notes) maintenance.notes = notes;
  if (workedDays && Array.isArray(workedDays)) {
    maintenance.workedDays = workedDays;
    if (workedDays.length > 0) {
      maintenance.completionDate = workedDays[workedDays.length - 1];
    }
  }

  const updatedMaintenance = await maintenance.save();

  const populatedMaintenance = await Maintenance.findByPk(updatedMaintenance.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
  });

  await AuditLog.create({
    action: 'update',
    entityType: 'maintenance',
    entityId: maintenance.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Updated maintenance record`,
    changes: JSON.stringify({
      before: oldValues,
      after: {
        status: updatedMaintenance.status,
        type: updatedMaintenance.type,
        cost: updatedMaintenance.cost,
        workedDaysCount: (updatedMaintenance.workedDays || []).length,
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').to(`maintenance_${maintenance.id}`).emit('maintenance_updated', {
    maintenanceId: maintenance.id,
    status: updatedMaintenance.status,
  });

  res.status(200).json({
    success: true,
    message: 'Maintenance record updated successfully',
    data: transformMaintenanceData(populatedMaintenance),
  });
});

// Delete maintenance
exports.deleteMaintenance = asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findByPk(req.params.id);

  if (!maintenance) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance record not found',
    });
  }

  const maintenanceData = maintenance.toJSON();
  await maintenance.destroy();

  await AuditLog.create({
    action: 'delete',
    entityType: 'maintenance',
    entityId: maintenanceData.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Deleted maintenance record`,
    changes: JSON.stringify({
      before: {
        type: maintenanceData.type,
        cost: maintenanceData.cost,
      },
    }),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Maintenance record deleted successfully',
  });
});
