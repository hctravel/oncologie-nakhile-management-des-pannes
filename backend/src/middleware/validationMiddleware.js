const { body, param, query, validationResult } = require('express-validator');

// Validation middleware that checks for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// Sanitization middleware - simple SQL injection prevention
const sanitizeInputs = (req, res, next) => {
  // Basic sanitization of string inputs
  const sanitizeValue = (val) => {
    if (typeof val === 'string') {
      return val.replace(/[<>\"\']/g, '');
    }
    return val;
  };

  // Sanitize all request properties
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeValue(req.body[key]);
    });
  }
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitizeValue(req.params[key]);
    });
  }
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeValue(req.query[key]);
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Register validation
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'áéèêëàâäùûüôöçñ]+$/i)
    .withMessage('Name contains invalid characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('role')
    .optional()
    .isIn(['user', 'technician', 'admin', 'super admin', 'reception'])
    .withMessage('Invalid role'),
  handleValidationErrors,
];

// User update validation
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'áéèêëàâäùûüôöçñ]+$/i)
    .withMessage('Name contains invalid characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['user', 'technician', 'admin', 'super admin', 'reception'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors,
];

// Search validation - prevents NoSQL injection
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long')
    .matches(/^[a-zA-Z0-9\s\-\.@áéèêëàâäùûüôöçñ]*$/)
    .withMessage('Search contains invalid characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

// Machine validation
const validateMachine = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Machine name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Name must be between 2 and 150 characters'),
  body('serialNumber')
    .trim()
    .notEmpty()
    .withMessage('Serial number is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial number must be between 1 and 100 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 }),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('type')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('price')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors,
];

// Panne validation
const validatePanne = [
  body('machineId')
    .toInt()
    .notEmpty()
    .withMessage('Machine ID is required')
    .isInt({ min: 1 })
    .withMessage('Invalid machine ID - must be a positive integer'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('status')
    .optional()
    .isIn(['reported', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('assignedTechnician')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Assigned technician name too long'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes too long'),
  body('costEstimate')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Cost estimate must be a positive number'),
  body('actualCost')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be a positive number'),
  body('reportDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid report date format'),
  body('resolvedDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Invalid resolved date format')
];

// Maintenance validation
const validateMaintenance = [
  body('machineId')
    .toInt()
    .notEmpty()
    .withMessage('Machine ID is required')
    .isInt({ min: 1 })
    .withMessage('Invalid machine ID'),
  body('maintenanceDate')
    .notEmpty()
    .withMessage('Maintenance date is required')
    .isISO8601()
    .withMessage('Invalid maintenance date format'),
  body('type')
    .optional()
    .trim()
    .isIn(['preventive', 'corrective', 'inspection'])
    .withMessage('Invalid maintenance type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body('cost')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('technician')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Technician name too long'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes too long'),
  body('workedDays')
    .optional()
    .isArray()
    .withMessage('Worked days must be an array'),
  handleValidationErrors,
];

// Machine usage validation
const validateMachineUsage = [
  body('machineId')
    .toInt()
    .notEmpty()
    .withMessage('Machine ID is required')
    .isInt({ min: 1 })
    .withMessage('Invalid machine ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('usageType')
    .notEmpty()
    .withMessage('Usage type is required')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Usage type must be between 1 and 200 characters'),
  body('numberOfPatients')
    .toInt()
    .notEmpty()
    .withMessage('Number of patients is required')
    .isInt({ min: 1 })
    .withMessage('Number of patients must be a positive integer'),
  body('amount')
    .toFloat()
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  handleValidationErrors,
];

module.exports = {
  sanitizeInputs,
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateUserUpdate,
  validateSearch,
  validateMachine,
  validatePanne,
  validateMaintenance,
  validateMachineUsage,
};
