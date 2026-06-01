const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} = require('../controllers/userController');
const { validateSearch, validateUserUpdate } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin and SuperAdmin can view users
router.get('/', authorize('admin', 'super admin'), validateSearch, getAllUsers);
// Admin and SuperAdmin can create users
router.post('/', authorize('admin', 'super admin'), createUser);
// Admin and SuperAdmin can get user details
router.get('/:id', authorize('admin', 'super admin'), getUserById);
// Admin and SuperAdmin can update users
router.put('/:id', authorize('admin', 'super admin'), validateUserUpdate, updateUser);
// Admin and SuperAdmin can delete users
router.delete('/:id', authorize('admin', 'super admin'), deleteUser);

// User can change their own password
router.post('/change-password', changePassword);

module.exports = router;
