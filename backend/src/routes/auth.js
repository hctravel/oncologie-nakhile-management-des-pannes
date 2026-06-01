const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
} = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/register', authenticate, validateRegister, register);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;