/**
 * Logger utility
 * Centralized logging with levels and environment-aware output
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const shouldLog = (level) => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  const currentLevelIndex = levels.indexOf(logLevel.toUpperCase());
  const messageLevelIndex = levels.indexOf(level);

  return messageLevelIndex <= currentLevelIndex;
};

const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;

  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
};

const logger = {
  error: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(formatMessage(LOG_LEVELS.ERROR, message, data));
    }
  },

  warn: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatMessage(LOG_LEVELS.WARN, message, data));
    }
  },

  info: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(formatMessage(LOG_LEVELS.INFO, message, data));
    }
  },

  debug: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(formatMessage(LOG_LEVELS.DEBUG, message, data));
    }
  },
};

module.exports = logger;
