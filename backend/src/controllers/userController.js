const { User, AuditLog } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get all users (SuperAdmin only)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;

  let where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const startIndex = (page - 1) * limit;

  const users = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    limit: limit * 1,
    offset: startIndex,
  });

  const total = await User.count({ where });

  await AuditLog.create({
    action: 'read',
    entityType: 'user',
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed users list`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
    data: { users },
  });
});

// Get single user by ID
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  await AuditLog.create({
    action: 'read',
    entityType: 'user',
    entityId: user.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Viewed user details: ${user.email}`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Create new user (SuperAdmin only)
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phoneNumber, department, isActive } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    phoneNumber: phoneNumber || null,
    department: department || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  await AuditLog.create({
    action: 'create',
    entityType: 'user',
    entityId: user.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Created new user: ${user.email} with role: ${user.role}`,
    changes: JSON.stringify({
      after: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }),
    status: 'success',
  });

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: userResponse,
  });
});

// Update user
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isActive } = req.body;

  let user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Store old values for audit log
  const oldValues = {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  const updatedUser = await user.save();

  await AuditLog.create({
    action: 'update',
    entityType: 'user',
    entityId: user.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Updated user: ${user.email}`,
    changes: JSON.stringify({
      before: oldValues,
      after: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    }),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});

// Delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const userData = user.toJSON();
  await user.destroy();

  await AuditLog.create({
    action: 'delete',
    entityType: 'user',
    entityId: userData.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Deleted user: ${userData.email}`,
    changes: JSON.stringify({
      before: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
    }),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all password fields',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New passwords do not match',
    });
  }

  if (newPassword.length < 12) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 12 characters',
    });
  }

  const user = await User.findByPk(req.user.id);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  user.password = newPassword;
  await user.save();

  await AuditLog.create({
    action: 'update',
    entityType: 'user',
    entityId: user.id,
    userId: req.user.id,
    userRole: req.user.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    description: `Changed password`,
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});
