const { MachineUsage, MedicalMachine, AuditLog, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Transform machine usage data to match frontend field names
const transformMachineUsageData = (item) => {
  const data = item.toJSON ? item.toJSON() : item;
  return {
    ...data,
    date: data.usageDate,
    numberOfPatients: data.quantity,
    amount: data.unitPrice,
    usageType: data.notes,
  };
};

// Get all machine usage records
exports.getAllUsage = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', machineId = '', startDate = '', endDate = '' } = req.query;

  let where = {};

  if (machineId) {
    where.machineId = machineId;
  }

  if (search) {
    where[Op.or] = [
      { notes: { [Op.like]: `%${search}%` } },
    ];
  }

  if (startDate || endDate) {
    where.usageDate = {};
    if (startDate) {
      where.usageDate[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.usageDate[Op.lte] = end;
    }
  }

  const startIndex = (page - 1) * limit;

  const records = await MachineUsage.findAll({
    where,
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
    limit: limit * 1,
    offset: startIndex,
    order: [['usageDate', 'DESC']],
  });

  const total = await MachineUsage.count({ where });

  await AuditLog.create({
    action: 'read',
    entityType: 'machineUsage',
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed machine usage list`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: { usage: records.map(transformMachineUsageData) },
  });
});

// Get single usage record
exports.getUsageById = asyncHandler(async (req, res, next) => {
  const record = await MachineUsage.findByPk(req.params.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Machine usage record not found',
    });
  }

  await AuditLog.create({
    action: 'read',
    entityType: 'machineUsage',
    entityId: record.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed machine usage details`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    data: transformMachineUsageData(record),
  });
});

// Create usage record
exports.createUsage = asyncHandler(async (req, res, next) => {
  // Frontend sends: machineId, date, usageType, numberOfPatients
  // Backend model expects: machineId, usageDate, quantity, unitPrice (optional), notes
  const { machineId, date, usageType, numberOfPatients, amount, usageDate, quantity, unitPrice, notes } = req.body;

  // Support both frontend and backend field names
  const finalMachineId = machineId;
  const finalUsageDate = date || usageDate;
  const finalQuantity = numberOfPatients || quantity;
  const finalUnitPrice = amount || unitPrice || 0; // Default to 0 if not provided
  const finalNotes = usageType || notes;

  if (!finalMachineId || !finalUsageDate || !finalQuantity) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: machineId, date/usageDate, numberOfPatients/quantity',
    });
  }

  // Verify machine exists
  const machine = await MedicalMachine.findByPk(finalMachineId);
  if (!machine) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found',
    });
  }

  const record = await MachineUsage.create({
    machineId: finalMachineId,
    usageDate: finalUsageDate,
    quantity: parseInt(finalQuantity) || 1,
    unitPrice: parseFloat(finalUnitPrice) || 0,
    notes: finalNotes || '',
    recordedBy: req.user.id,
  });

  const populatedRecord = await MachineUsage.findByPk(record.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
  });

  await AuditLog.create({
    action: 'create',
    entityType: 'machineUsage',
    entityId: record.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Created usage record for machine: ${machine.name}`,
    changes: JSON.stringify({
      after: {
        quantity: record.quantity,
        unitPrice: record.unitPrice,
        revenue: (record.quantity * record.unitPrice).toFixed(2),
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').emit('usage_created', {
    usageId: record.id,
    machineId: record.machineId,
    revenue: (record.quantity * record.unitPrice).toFixed(2),
  });

  res.status(201).json({
    success: true,
    message: 'Machine usage record created successfully',
    data: transformMachineUsageData(populatedRecord),
  });
});

// Update usage record
exports.updateUsage = asyncHandler(async (req, res, next) => {
  const { usageDate, quantity, unitPrice, notes } = req.body;

  let record = await MachineUsage.findByPk(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Machine usage record not found',
    });
  }

  const oldValues = {
    quantity: record.quantity,
    unitPrice: record.unitPrice,
    revenue: (record.quantity * record.unitPrice).toFixed(2),
  };

  if (usageDate) record.usageDate = usageDate;
  if (quantity !== undefined) record.quantity = quantity;
  if (unitPrice !== undefined) record.unitPrice = unitPrice;
  if (notes !== undefined) record.notes = notes;

  const updatedRecord = await record.save();

  const populatedRecord = await MachineUsage.findByPk(updatedRecord.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'recordedByUser', attributes: ['name', 'email'] },
    ],
  });

  await AuditLog.create({
    action: 'update',
    entityType: 'machineUsage',
    entityId: record.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Updated machine usage record`,
    changes: JSON.stringify({
      before: oldValues,
      after: {
        quantity: updatedRecord.quantity,
        unitPrice: updatedRecord.unitPrice,
        revenue: (updatedRecord.quantity * updatedRecord.unitPrice).toFixed(2),
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').to(`usage_${record.id}`).emit('usage_updated', {
    usageId: record.id,
    revenue: (updatedRecord.quantity * updatedRecord.unitPrice).toFixed(2),
  });

  res.status(200).json({
    success: true,
    message: 'Machine usage record updated successfully',
    data: transformMachineUsageData(populatedRecord),
  });
});

// Delete usage record
exports.deleteUsage = asyncHandler(async (req, res, next) => {
  const record = await MachineUsage.findByPk(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Machine usage record not found',
    });
  }

  const recordData = record.toJSON();
  await record.destroy();

  await AuditLog.create({
    action: 'delete',
    entityType: 'machineUsage',
    entityId: recordData.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Deleted machine usage record`,
    changes: JSON.stringify({
      before: {
        quantity: recordData.quantity,
        revenue: (recordData.quantity * recordData.unitPrice).toFixed(2),
      },
    }),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Machine usage record deleted successfully',
  });
});

// Get total amount of machine usage records
exports.getTotalAmount = asyncHandler(async (req, res, next) => {
  const { machineId, startDate, endDate } = req.query;

  let where = {};

  if (machineId) {
    where.machineId = machineId;
  }

  if (startDate || endDate) {
    where.usageDate = {};
    if (startDate) {
      where.usageDate[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.usageDate[Op.lte] = end;
    }
  }

  const records = await MachineUsage.findAll({ where });

  const totalAmount = records.reduce((sum, record) => {
    return sum + (record.quantity * record.unitPrice);
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    },
  });
});
