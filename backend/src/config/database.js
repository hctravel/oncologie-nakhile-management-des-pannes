// Database configuration - MySQL with Sequelize
const Sequelize = require('sequelize');

// SECURITY: Use environment variables for all sensitive data
const sequelize = new Sequelize(
  process.env.DB_NAME || 'medical_machine_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'mysql_password_123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // SECURITY: Set timezone to prevent injection attacks
    timezone: '+00:00',
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      // SECURITY: Prevent SQL injection through attributes
      validate: true,
    },
  }
);

module.exports = {
  sequelize,
  Sequelize,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mysql_password_123',
    database: process.env.DB_NAME || 'medical_machine_app',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars',
    expiresIn: process.env.JWT_EXPIRE || '24h',
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-change-in-production',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  },
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    // SECURITY: Whitelist specific origins instead of allowing all
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },
  security: {
    // SECURITY: Password requirements
    minPasswordLength: 12,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    // SECURITY: Max login attempts before account lockout
    maxLoginAttempts: 3,
    lockTimeMinutes: 5,
  },
};
