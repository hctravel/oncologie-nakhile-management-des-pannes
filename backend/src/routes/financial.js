const express = require('express');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { FinancialRecord, AuditLog } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

router.use(authenticate);

// Get financial records with date range filtering
router.get('/', asyncHandler(async (req, res, next) => {
  const { startDate, endDate, page = 1, limit = 10, type = '' } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = {};

  // Add date range filter
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) {
      whereClause.date[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date[Op.lte] = end;
    }
  }

  // Filter by type if provided
  if (type) {
    whereClause.type = type;
  }

  try {
    const { count, rows } = await FinancialRecord.findAndCountAll({
      where: whereClause,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching financial records',
      error: error.message,
    });
  }
}));

// Get single financial record
router.get('/:id', asyncHandler(async (req, res, next) => {
  const record = await FinancialRecord.findByPk(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Financial record not found',
    });
  }

  res.status(200).json({
    success: true,
    data: record,
  });
}));

// Create financial record
router.post('/', asyncHandler(async (req, res, next) => {
  const { machineId, description, type, amount, reference } = req.body;

  try {
    const record = await FinancialRecord.create({
      machineId,
      description,
      type,
      amount,
      reference,
      recordedBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      action: 'create',
      entityType: 'financial',
      entityId: record.id,
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `Created financial record: ${type} - $${amount}`,
      changes: {
        after: {
          type: record.type,
          amount: record.amount,
        },
      },
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Financial record created successfully',
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating financial record',
      error: error.message,
    });
  }
}));

// Update financial record
router.put('/:id', asyncHandler(async (req, res, next) => {
  const { amount, description } = req.body;

  try {
    const record = await FinancialRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found',
      });
    }

    const oldValues = {
      amount: record.amount,
      description: record.description,
    };

    if (amount !== undefined) record.amount = amount;
    if (description) record.description = description;

    const updatedRecord = await record.save();

    // Audit log
    await AuditLog.create({
      action: 'update',
      entityType: 'financial',
      entityId: record.id,
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `Updated financial record`,
      changes: {
        before: oldValues,
        after: {
          amount: updatedRecord.amount,
          description: updatedRecord.description,
        },
      },
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Financial record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating financial record',
      error: error.message,
    });
  }
}));

// Delete financial record
router.delete('/:id', asyncHandler(async (req, res, next) => {
  try {
    const record = await FinancialRecord.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Financial record not found',
      });
    }

    const recordData = {
      type: record.type,
      amount: record.amount,
    };

    await record.destroy();

    // Audit log
    await AuditLog.create({
      action: 'delete',
      entityType: 'financial',
      entityId: record.id,
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `Deleted financial record`,
      changes: {
        before: recordData,
      },
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Financial record deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting financial record',
      error: error.message,
    });
  }
}));

// Get financial summary
router.get('/summary/all', asyncHandler(async (req, res, next) => {
  try {
    const { sequelize } = require('../config/database');
    const { QueryTypes } = require('sequelize');

    const totalByType = await sequelize.query(
      `SELECT type, SUM(amount) as total FROM FinancialRecords GROUP BY type`,
      { type: QueryTypes.SELECT }
    );

    const summary = {};
    totalByType.forEach(record => {
      summary[record.type] = record.total;
    });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: error.message,
    });
  }
}));

module.exports = router;
