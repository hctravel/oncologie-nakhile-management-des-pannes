const express = require('express');
const { authenticate } = require('../middleware/auth');
const { sanitizeInputs, validatePanne } = require('../middleware/validationMiddleware');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getAllPannes,
  getPanneById,
  createPanne,
  updatePanne,
  deletePanne,
} = require('../controllers/panneController');

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
router.get('/', getAllPannes);
router.get('/:id', getPanneById);

// POST routes
router.post('/', validatePanne, createPanne);

// PUT routes
router.put('/:id', updatePanne);

// DELETE routes
router.delete('/:id', deletePanne);

module.exports = router;
