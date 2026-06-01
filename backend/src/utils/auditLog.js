const { AuditLog } = require('../models');

/**
 * Create audit log entry
 * Eliminates duplicate AuditLog.create() calls across all controllers
 * 
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} entityType - Type of entity (Machine, User, Panne, etc.)
 * @param {number} entityId - ID of the entity being acted upon
 * @param {number} userId - ID of user performing the action
 * @param {object} changes - Details of what changed
 * @param {string} ipAddress - Client IP address
 * @returns {Promise<object>} - The created audit log
 */
const createAuditLog = async (
  action,
  entityType,
  entityId,
  userId,
  changes = {},
  ipAddress = 'unknown'
) => {
  try {
    return await AuditLog.create({
      action,
      entityType,
      entityId,
      userId,
      changes: JSON.stringify(changes),
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    // Log errors but don't throw - audit logging should not break operations
    console.warn('Failed to create audit log:', error.message);
    return null;
  }
};

/**
 * Create audit log from request context
 * Convenience wrapper that extracts user/IP from request
 * 
 * @param {object} req - Express request object
 * @param {string} action - Action type
 * @param {string} entityType - Entity type
 * @param {number} entityId - Entity ID
 * @param {object} changes - Changes object
 * @returns {Promise<object>} - The created audit log
 */
const createAuditLogFromRequest = async (
  req,
  action,
  entityType,
  entityId,
  changes = {}
) => {
  const userId = req.user?.id || null;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

  return createAuditLog(action, entityType, entityId, userId, changes, ipAddress);
};

module.exports = {
  createAuditLog,
  createAuditLogFromRequest,
};
