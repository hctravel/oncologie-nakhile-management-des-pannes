const { MedicalMachine, AuditLog, Panne, Maintenance, MachineUsage, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get all machines
exports.getAllMachines = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query;

  let where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { serialNumber: { [Op.like]: `%${search}%` } },
      { type: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const startIndex = (page - 1) * limit;

  const machines = await MedicalMachine.findAll({
    where,
    include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }],
    limit: limit * 1,
    offset: startIndex,
  });

  const total = await MedicalMachine.count({ where });

  await AuditLog.create({
    action: 'read',
    entityType: 'machine',
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed machines list`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    count: machines.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: { machines },
  });
});

// Get single machine
exports.getMachineById = asyncHandler(async (req, res, next) => {
  const machine = await MedicalMachine.findByPk(req.params.id, {
    include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }],
  });

  if (!machine) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found',
    });
  }

  await AuditLog.create({
    action: 'read',
    entityType: 'machine',
    entityId: machine.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed machine details: ${machine.name}`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    data: machine,
  });
});

// Create machine
exports.createMachine = asyncHandler(async (req, res, next) => {
  const { name, type, serialNumber, location, manufacturer, description, status, purchaseDate, price } = req.body;

  if (!name || !serialNumber || !location) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, serialNumber, location',
    });
  }

  const machine = await MedicalMachine.create({
    name,
    type: type || '',
    serialNumber,
    purchaseDate: purchaseDate || null,
    location,
    manufacturer: manufacturer || '',
    description: description || '',
    status: status || 'operational',
    createdBy: req.user.id,
  });

  await AuditLog.create({
    action: 'create',
    entityType: 'machine',
    entityId: machine.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Created machine: ${machine.name}`,
    changes: JSON.stringify({
      after: {
        name: machine.name,
        type: machine.type,
        serialNumber: machine.serialNumber,
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').emit('machine_created', {
    machineId: machine.id,
    name: machine.name,
  });

  res.status(201).json({
    success: true,
    message: 'Machine created successfully',
    data: machine,
  });
});

// Update machine
exports.updateMachine = asyncHandler(async (req, res, next) => {
  const { name, type, status, location, description, warrantyExpiryDate, price, manufacturer, purchaseDate, serialNumber } = req.body;

  let machine = await MedicalMachine.findByPk(req.params.id);

  if (!machine) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found',
    });
  }

  const oldValues = {
    name: machine.name,
    type: machine.type,
    status: machine.status,
    location: machine.location,
    price: machine.price,
    manufacturer: machine.manufacturer,
  };

  if (name) machine.name = name;
  if (type) machine.type = type;
  if (status) machine.status = status;
  if (location) machine.location = location;
  if (description) machine.description = description;
  if (warrantyExpiryDate) machine.warrantyExpiryDate = warrantyExpiryDate;
  if (price !== undefined) machine.price = price;
  if (manufacturer) machine.manufacturer = manufacturer;
  if (purchaseDate) machine.purchaseDate = purchaseDate;
  if (serialNumber) machine.serialNumber = serialNumber;

  const updatedMachine = await machine.save();

  await AuditLog.create({
    action: 'update',
    entityType: 'machine',
    entityId: machine.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Updated machine: ${machine.name}`,
    changes: JSON.stringify({
      before: oldValues,
      after: {
        name: updatedMachine.name,
        type: updatedMachine.type,
        status: updatedMachine.status,
        location: updatedMachine.location,
        price: updatedMachine.price,
        manufacturer: updatedMachine.manufacturer,
      },
    }),
    status: 'success',
  });

  // Emit real-time event
  req.app.get('io').to(`machine_${machine.id}`).emit('machine_updated', {
    machineId: machine.id,
    status: updatedMachine.status,
  });

  res.status(200).json({
    success: true,
    message: 'Machine updated successfully',
    data: updatedMachine,
  });
});

// Delete machine
exports.deleteMachine = asyncHandler(async (req, res, next) => {
  const machine = await MedicalMachine.findByPk(req.params.id);

  if (!machine) {
    return res.status(404).json({
      success: false,
      message: 'Machine not found',
    });
  }

  const machineData = machine.toJSON();
  await machine.destroy();

  await AuditLog.create({
    action: 'delete',
    entityType: 'machine',
    entityId: machineData.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Deleted machine: ${machineData.name}`,
    changes: JSON.stringify({
      before: {
        name: machineData.name,
        type: machineData.type,
      },
    }),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Machine deleted successfully',
  });
});
