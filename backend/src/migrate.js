#!/usr/bin/env node

/**
 * Database Migration Script - Simplified
 * Initializes MySQL database for Medical Machine Management System
 */

require('dotenv').config();
const Sequelize = require('sequelize');
const bcryptjs = require('bcryptjs');

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'medical_machine_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

// Define User Model
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(120),
    unique: true,
    allowNull: false,
    lowercase: true,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM('user', 'technician', 'admin', 'super admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  loginAttempts: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  lockUntil: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  phoneNumber: {
    type: Sequelize.STRING(20),
    allowNull: true,
  },
  department: {
    type: Sequelize.STRING(100),
    allowNull: true,
  },
  createdBy: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
      }
    },
  },
});


async function migrate() {
  try {
    console.log('\n🔄 Initializing Database Migration...\n');
    
    console.log('📡 Testing MySQL connection...');
    await sequelize.authenticate();
    console.log('✅ MySQL connection authenticated\n');

    console.log('🔄 Synchronizing database schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synchronized\n');

    console.log('👤 Setting up default users...\n');

    // Superadmin
    let superadmin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!superadmin) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123456789',
        role: 'super admin',
        isActive: true,
      });
      console.log('✅ Super Admin user created successfully');
      console.log('   Email: admin@example.com');
      console.log('   Password: Admin@123456789\n');
    } else {
      console.log('✓ Super Admin user already exists\n');
    }

    // Admin
    let admin = await User.findOne({ where: { email: 'admin2@example.com' } });
    if (!admin) {
      await User.create({
        name: 'Sample Admin',
        email: 'admin2@example.com',
        password: 'Admin@123456789',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin2@example.com');
      console.log('   Password: Admin@123456789\n');
    } else {
      console.log('✓ Admin user already exists\n');
    }

    // Technician
    let tech = await User.findOne({ where: { email: 'tech@example.com' } });
    if (!tech) {
      await User.create({
        name: 'Tech User',
        email: 'tech@example.com',
        password: 'Tech@123456',
        role: 'technician',
        isActive: true,
      });
      console.log('✅ Technician user created');
      console.log('   Email: tech@example.com');
      console.log('   Password: Tech@123456\n');
    } else {
      console.log('✓ Technician user already exists\n');
    }

    console.log('✅ Database migration completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Superadmin: admin@example.com / Admin@123456789');
    console.log('   Admin: admin2@example.com / Admin@123456789');
    console.log('   Technician: tech@example.com / Tech@123456\n');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database migration failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  MySQL is not running!');
      console.error('Please start MySQL:');
      console.error('   macOS: brew services start mysql');
      console.error('   Windows: net start MySQL80');
      console.error('   Linux: sudo systemctl start mysql\n');
    }
    
    process.exit(1);
  }
}

migrate();
