const express = require('express');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { MedicalMachine, Panne, Maintenance, MachineUsage, FinancialRecord } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

router.use(authenticate);

// Get dashboard summary
router.get('/summary', asyncHandler(async (req, res, next) => {
  try {
    // Get machine counts
    const totalMachines = await MedicalMachine.count();
    const operationalMachines = await MedicalMachine.count({ where: { status: 'operational' } });
    const brokenMachines = await MedicalMachine.count({ where: { status: 'broken' } });

    // Get panne counts - fix the status filter using Op.in
    const activePannes = await Panne.count({ 
      where: { 
        status: { [Op.in]: ['reported', 'in_progress'] }
      } 
    });

    // Get financial totals
    const maintenanceCosts = await Maintenance.sum('cost', { where: { status: 'completed' } });
    const financialTotal = await FinancialRecord.sum('amount');
    const completedMaintenance = await Maintenance.count({ where: { status: 'completed' } });

    res.status(200).json({
      success: true,
      data: {
        totalMachines: totalMachines || 0,
        operationalMachines: operationalMachines || 0,
        brokenMachines: brokenMachines || 0,
        activePannes: activePannes || 0,
        totalRevenue: financialTotal || 0,
        totalMaintenanceCost: maintenanceCosts || 0,
        completedMaintenance: completedMaintenance || 0,
        totalPanneCost: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching summary',
      error: error.message,
    });
  }
}));

// Get machine report
router.get('/machines', asyncHandler(async (req, res, next) => {
  const machines = await MedicalMachine.findAll();
  res.status(200).json({
    success: true,
    data: machines,
  });
}));

// Get maintenance report
router.get('/maintenance', asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findAll({
    order: [['scheduledDate', 'DESC']],
  });
  res.status(200).json({
    success: true,
    data: maintenance,
  });
}));

module.exports = router;
