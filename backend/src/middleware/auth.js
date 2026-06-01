const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/database');

// DEMO MODE: Authentication disabled - allow all requests with demo user
const authenticate = async (req, res, next) => {
  try {
    // Create demo user for testing (using ID 1 - the seeded admin user)
    req.user = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'super admin',
      isActive: true,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// DEMO MODE: Authorization disabled - allow all roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Authentication disabled - allow all access
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
