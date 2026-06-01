const express = require('express');
const { authenticate } = require('../middleware/auth');
const { sanitizeInputs, validateMachineUsage } = require('../middleware/validationMiddleware');
const {
  getAllUsage,
  getUsageById,
  createUsage,
  updateUsage,
  deleteUsage,
  getTotalAmount,
} = require('../controllers/machineUsageController');

const router = express.Router();

router.use(authenticate);

// Apply sanitization to all routes
router.use(sanitizeInputs);

// GET routes
router.get('/total-amount', getTotalAmount);
router.get('/', getAllUsage);
router.get('/:id', getUsageById);

// POST routes
router.post('/', validateMachineUsage, createUsage);

// PUT routes
router.put('/:id', updateUsage);

// DELETE routes
router.delete('/:id', deleteUsage);

module.exports = router;
