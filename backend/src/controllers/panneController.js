const { Panne, MedicalMachine, AuditLog, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get all pannes
exports.getAllPannes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = '', severity = '' } = req.query;

  let where = {};

  if (search) {
    where[Op.or] = [
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (severity) {
    where.severity = severity;
  }

  const startIndex = (page - 1) * limit;

  const pannes = await Panne.findAll({
    where,
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'reportedByUser', attributes: ['name', 'email'] },
      { model: User, as: 'assignedTechnicianUser', attributes: ['name', 'email'] },
    ],
    limit: limit * 1,
    offset: startIndex,
    order: [['reportDate', 'DESC']],
  });

  const total = await Panne.count({ where });

  await AuditLog.create({
    action: 'read',
    entityType: 'panne',
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed panne list`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    count: pannes.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: { pannes },
  });
});

// Get single panne
exports.getPanneById = asyncHandler(async (req, res, next) => {
  const panne = await Panne.findByPk(req.params.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'reportedByUser', attributes: ['name', 'email'] },
      { model: User, as: 'assignedTechnicianUser', attributes: ['name', 'email'] },
    ],
  });

  if (!panne) {
    return res.status(404).json({
      success: false,
      message: 'Panne record not found',
    });
  }

  await AuditLog.create({
    action: 'read',
    entityType: 'panne',
    entityId: panne.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed panne details`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    data: panne,
  });
});

// Create panne
exports.createPanne = asyncHandler(async (req, res, next) => {
  const { machineId, codePanne, description, instantPanne, status, assignedTechnician, notes, cost, reportDate, resolvedDate } = req.body;

  console.log('📝 Panne Create Request Body:', JSON.stringify(req.body));
  console.log('machineId:', machineId, 'type:', typeof machineId);
  console.log('description:', description, 'type:', typeof description);

  if (!machineId || !description) {
    console.error('❌ Validation failed - Missing required fields');
    return res.status(400).json({
      success: false,
      message: `Missing required fields - machineId: ${machineId ? 'ok' : 'missing'}, description: ${description ? 'ok' : 'missing'}`,
      received: { machineId, description },
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

  
  const panne = await Panne.create({
    machineId,
    codePanne: codePanne && codePanne.toString().trim() ? codePanne.toString().trim() : null,
    description,
    instantPanne: instantPanne || null,
    status: status || 'reported',
    assignedTechnician: assignedTechnician && assignedTechnician.toString().trim() ? parseInt(assignedTechnician) : null,
    notes: notes || null,
    cost: cost ? parseFloat(cost) : null,
    reportDate: reportDate || new Date(),
    resolvedDate: resolvedDate || null,
    reportedBy: req.user?.id ? Number(req.user.id) || null : null,
    history: JSON.stringify([
      {
        status: status || 'reported',
        changedBy: req.user?.id || null,
        notes: `Panne reported: ${description}`,
      },
    ]),
  });

  const populatedPanne = await Panne.findByPk(panne.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'reportedByUser', attributes: ['name', 'email'] },
      { model: User, as: 'assignedTechnicianUser', attributes: ['name', 'email'] },
    ],
  });

  await AuditLog.create({
    action: 'create',
    entityType: 'panne',
    entityId: panne.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Created panne for machine: ${machine.name}`,
    changes: JSON.stringify({
      after: {
        severity: panne.severity,
        status: panne.status,
        assignedTechnician: panne.assignedTechnician,
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').emit('panne_created', {
    panneId: panne.id,
    machineId: panne.machineId,
  });

  res.status(201).json({
    success: true,
    message: 'Panne record created successfully',
    data: populatedPanne,
  });
});

// Update panne
exports.updatePanne = asyncHandler(async (req, res, next) => {
  const { description, status, notes, cost, resolvedDate, assignedTechnician, codePanne, instantPanne } = req.body;

  let panne = await Panne.findByPk(req.params.id);

  if (!panne) {
    return res.status(404).json({
      success: false,
      message: 'Panne record not found',
    });
  }

  const oldValues = {
    status: panne.status,
  };

  if (description) panne.description = description;
  if (codePanne !== undefined) panne.codePanne = codePanne && codePanne.toString().trim() ? codePanne.toString().trim() : null;
  if (instantPanne !== undefined) panne.instantPanne = instantPanne || null;
  if (status && status !== panne.status) {
    panne.status = status;
    // Add to history
    const history = panne.history ? JSON.parse(panne.history) : [];
    history.push({
      status: status,
      changedBy: req.user.id,
      notes: notes || `Status changed to ${status}`,
    });
    panne.history = JSON.stringify(history);
  }
  if (notes) panne.notes = notes;
  if (cost !== undefined) panne.cost = cost;
  if (resolvedDate !== undefined) {
    panne.resolvedDate = resolvedDate;
  }
  if (assignedTechnician) panne.assignedTechnician = assignedTechnician;

  const updatedPanne = await panne.save();

  const populatedPanne = await Panne.findByPk(updatedPanne.id, {
    include: [
      { model: MedicalMachine, as: 'machine', attributes: ['name', 'type', 'serialNumber'] },
      { model: User, as: 'reportedByUser', attributes: ['name', 'email'] },
      { model: User, as: 'assignedTechnicianUser', attributes: ['name', 'email'] },
    ],
  });

  await AuditLog.create({
    action: 'update',
    entityType: 'panne',
    entityId: panne.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Updated panne record`,
    changes: JSON.stringify({
      before: oldValues,
      after: {
        status: updatedPanne.status,
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').to(`panne_${panne.id}`).emit('panne_updated', {
    panneId: panne.id,
    status: updatedPanne.status,
  });

  res.status(200).json({
    success: true,
    message: 'Panne record updated successfully',
    data: populatedPanne,
  });
});

// Delete panne
exports.deletePanne = asyncHandler(async (req, res, next) => {
  const panne = await Panne.findByPk(req.params.id);

  if (!panne) {
    return res.status(404).json({
      success: false,
      message: 'Panne record not found',
    });
  }

  const panneData = panne.toJSON();
  await panne.destroy();

  await AuditLog.create({
    action: 'delete',
    entityType: 'panne',
    entityId: panneData.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Deleted panne record`,
    changes: JSON.stringify({
      before: {
        severity: panneData.severity,
        status: panneData.status,
      },
    }),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Panne record deleted successfully',
  });
});
