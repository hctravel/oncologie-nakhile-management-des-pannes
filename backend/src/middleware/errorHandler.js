// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details server-side
  console.error(err);

  // MySQL duplicate key error
  if (err.code === 'ER_DUP_ENTRY') {
    const field = err.sql?.match(/for key '([^']+)'/)?.[1] || 'unknown field';
    const message = `This ${field.split('.').pop()} already exists`;
    error = { message, statusCode: 400 };
  }

  // MySQL error codes
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referenced record not found';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_BAD_NULL_ERROR' || err.code === 'ER_NO_NULL_FOR_NOT_NULL') {
    const field = err.sql?.match(/`([^`]+)`\)/) ?? 'field';
    const message = `${field[1] || 'Required field'} cannot be empty`;
    error = { message, statusCode: 400 };
  }

  // Sequelize bad query
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors?.map(e => e.message).join(', ') || 'Validation error';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Never expose sensitive information in production
  const response = {
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(error.statusCode || err.statusCode || 500).json(response);
};

// Catch async errors wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
