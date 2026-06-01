/**
 * Data transformation utilities
 * Consolidates field name mappings and data transformations used across controllers
 */

/**
 * Transform machine data from backend to frontend format
 */
const transformMachineData = (machine) => ({
  id: machine.id,
  name: machine.name,
  model: machine.model,
  manufacturer: machine.manufacturer,
  purchaseDate: machine.purchaseDate,
  location: machine.location,
  status: machine.status,
  lastMaintenance: machine.lastMaintenance,
  createdAt: machine.createdAt,
  updatedAt: machine.updatedAt,
});

/**
 * Transform panne data from backend to frontend format
 */
const transformPanneData = (panne) => ({
  id: panne.id,
  machineId: panne.machineId,
  description: panne.description,
  severity: panne.severity,
  reportedBy: panne.reportedBy,
  status: panne.status,
  assignedTechnician: panne.assignedTechnician,
  reportedDate: panne.reportedDate,
  resolvedDate: panne.resolvedDate,
  createdAt: panne.createdAt,
  updatedAt: panne.updatedAt,
});

/**
 * Transform maintenance data from backend to frontend format
 */
const transformMaintenanceData = (maintenance) => ({
  id: maintenance.id,
  machineId: maintenance.machineId,
  maintenanceType: maintenance.maintenanceType,
  description: maintenance.description,
  scheduledDate: maintenance.scheduledDate,
  completedDate: maintenance.completedDate,
  technician: maintenance.technician,
  status: maintenance.status,
  cost: maintenance.cost,
  createdAt: maintenance.createdAt,
  updatedAt: maintenance.updatedAt,
});

/**
 * Transform machine usage data from backend to frontend format
 */
const transformMachineUsageData = (usage) => ({
  id: usage.id,
  machineId: usage.machineId,
  usageDate: usage.usageDate || usage.date,
  usageType: usage.usageType || usage.notes,
  duration: usage.duration,
  operator: usage.operator,
  notes: usage.notes,
  createdAt: usage.createdAt,
  updatedAt: usage.updatedAt,
});

/**
 * Sanitize form input - remove empty fields and trim strings
 */
const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      sanitized[key] = typeof value === 'string' ? value.trim() : value;
    }
  });
  
  return sanitized;
};

/**
 * Validate required fields
 */
const validateRequiredFields = (formData, requiredFields) => {
  const missing = requiredFields.filter(
    (field) => !formData[field] || formData[field].toString().trim() === ''
  );
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
};

module.exports = {
  transformMachineData,
  transformPanneData,
  transformMaintenanceData,
  transformMachineUsageData,
  sanitizeFormData,
  validateRequiredFields,
};
