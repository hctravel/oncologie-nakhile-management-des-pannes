const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sanitizeInputs } = require('../middleware/validationMiddleware');
const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} = require('../controllers/machineController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply sanitization to all routes
router.use(sanitizeInputs);

// Get all machines
router.get('/', getAllMachines);

// Get single machine
router.get('/:id', getMachineById);

// Admin and SuperAdmin can create machines
router.post('/', authorize('admin', 'super admin'), createMachine);

// Admin and SuperAdmin can update machines
router.put('/:id', authorize('admin', 'super admin'), updateMachine);

// Admin and SuperAdmin can delete machines
router.delete('/:id', authorize('admin', 'super admin'), deleteMachine);

module.exports = router;
