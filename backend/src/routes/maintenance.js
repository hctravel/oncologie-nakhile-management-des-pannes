const express = require('express');
const { authenticate } = require('../middleware/auth');
const { sanitizeInputs, validateMaintenance } = require('../middleware/validationMiddleware');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = require('../controllers/maintenanceController');

const router = express.Router();

router.use(authenticate);

// Apply sanitization to all routes
router.use(sanitizeInputs);

// IMPORTANT: Specific routes MUST come before :id route
// Get all technicians (users with technician role)
router.get('/technicians/list', asyncHandler(async (req, res, next) => {
  const technicians = await User.findAll({
    where: { role: 'technician', isActive: true },
    attributes: ['id', 'name', 'email', 'department'],
  });
  
  res.status(200).json({
    success: true,
    data: {
      technicians,
    },
  });
}));

// GET routes
router.get('/', getAllMaintenances);
router.get('/:id', getMaintenanceById);

// POST routes
router.post('/', validateMaintenance, createMaintenance);

// PUT routes
router.put('/:id', updateMaintenance);

// DELETE routes
router.delete('/:id', deleteMaintenance);

module.exports = router;
