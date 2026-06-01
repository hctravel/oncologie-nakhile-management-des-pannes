const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// SECURITY: Generate JWT token with secure payload
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
  });
};

// SECURITY: Generate Refresh Token with secure payload
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.refreshToken.secret, {
    expiresIn: config.refreshToken.expiresIn,
    algorithm: 'HS256',
  });
};

// Register user (SuperAdmin only)
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // SECURITY: Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  // SECURITY: Check if user already exists
  let user = await User.findOne({ where: { email } });
  if (user) {
    return res.status(400).json({
      success: false,
      message: 'User already exists',
    });
  }

  try {
    // Create user (password automatically hashed by Sequelize hook)
    user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      createdBy: req.user.id,
    });

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating user',
    });
  }
});

// SECURITY: Login with rate limiting and account lockout
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // SECURITY: Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  try {
    // SECURITY: Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // SECURITY: Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({
        success: false,
        message: 'Account is locked. Please try again later.',
      });
    }

    // SECURITY: Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled',
      });
    }

    // SECURITY: Compare password using bcryptjs
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      // Increment failed login attempts
      await user.incLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // SECURITY: Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// SECURITY: Refresh token with validation
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    // SECURITY: Verify refresh token signature
    const decoded = jwt.verify(refreshToken, config.refreshToken.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const newToken = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

// Logout
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// SECURITY: Get current logged-in user
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password', 'lockUntil'] },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      },
    },
  });
});
