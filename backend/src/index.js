require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
const xss = require('xss-clean');
const hpp = require('hpp');

const { sequelize } = require('./models');
const config = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: config.cors,
});

// SECURITY: Database connection with MySQL via Sequelize
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connected');
    // Use alter: true to safely add new columns without dropping tables
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized');

    // SECURITY: Create default users if they don't exist
    const { User } = require('./models');
    
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123456789',
        role: 'super admin',
        phoneNumber: '+1234567890',
        department: 'Administration',
        isActive: true,
      });
      console.log('✅ Super Admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: Admin@123456789');
    }

    const admin2Exists = await User.findOne({ where: { email: 'admin2@example.com' } });
    if (!admin2Exists) {
      await User.create({
        name: 'Sample Admin',
        email: 'admin2@example.com',
        password: 'Admin@123456789',
        role: 'admin',
        phoneNumber: '+1234567891',
        department: 'Medical Equipment',
        isActive: true,
      });
      console.log('✅ Sample admin user created');
      console.log('   Email: admin2@example.com');
      console.log('   Password: Admin@123456789');
    }

    const techExists = await User.findOne({ where: { email: 'tech@example.com' } });
    if (!techExists) {
      await User.create({
        name: 'Sample Technician',
        email: 'tech@example.com',
        password: 'Tech@123456789',
        role: 'technician',
        phoneNumber: '+1234567892',
        department: 'Maintenance',
        isActive: true,
      });
      console.log('✅ Technician user created');
      console.log('   Email: tech@example.com');
      console.log('   Password: Tech@123456789');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.warn('⚠️  Continuing in demo mode without database connection...');
    // Continue running the server even if database fails
  }
}

initDatabase();

// SECURITY: Middleware stack in correct order
// 1. Helmet - security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// 2. CORS - whitelist origins
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
}));

// 3. Express built-in middleware
app.use(express.json({ limit: '10kb' })); // SECURITY: Limit payload size
app.use(express.urlencoded({ limit: '10kb' }));

// 4. XSS protection - sanitize user input
app.use(xss());

// 5. HPP - Parameter Pollution prevention
app.use(hpp({
  whitelist: [
    'sort', 'fields', 'limit', 'page', 'search',
  ],
}));

// 6. Logging
app.use(morgan('combined'));

// 7. Rate limiting - general
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
});
app.use('/api/', limiter);

// SECURITY: Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

// SECURITY: Additional security headers
app.use((req, res, next) => {
  // Prevent framing/clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Disable content type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // HSTS for https
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Feature policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/machines', require('./routes/machines'));
app.use('/api/pannes', require('./routes/pannes'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/machine-usage', require('./routes/machineUsage'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/reports', require('./routes/reports'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    database: sequelize.authenticate() ? 'connected' : 'disconnected',
  });
;
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io events for real-time notifications
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Join user-specific room for notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Join machine-specific room for machine updates
  socket.on('join_machine_room', (machineId) => {
    socket.join(`machine_${machineId}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
const PORT = config.server.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.server.nodeEnv} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, io };
