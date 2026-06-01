require('dotenv').config();
const { sequelize, User } = require('./models');

async function seedDatabase() {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    // Sync models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database schema synchronized');

    // Clear existing test users
    await User.destroy({ where: { email: 'admin@example.com' } });
    await User.destroy({ where: { email: 'admin2@example.com' } });
    await User.destroy({ where: { email: 'tech@example.com' } });
    console.log('Cleared existing test users');

    // Create superadmin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123456789',
      role: 'super admin',
      phoneNumber: '+1234567890',
      department: 'Administration',
      isActive: true,
    });
    console.log('✅ Superadmin user created successfully');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin@123456789');

    // Create sample admin user
    const sampleAdmin = await User.create({
      name: 'Sample Admin',
      email: 'admin2@example.com',
      password: 'Admin@123456789',
      role: 'admin',
      phoneNumber: '+1234567891',
      department: 'Medical Equipment',
      isActive: true,
    });
    console.log('✅ Sample admin user created successfully');
    console.log('   Email: admin2@example.com');
    console.log('   Password: Admin@123456789');

    // Create sample technician user
    const technician = await User.create({
      name: 'Sample Technician',
      email: 'tech@example.com',
      password: 'Tech@123456789',
      role: 'technician',
      phoneNumber: '+1234567892',
      department: 'Maintenance',
      isActive: true,
    });
    console.log('✅ Sample technician user created successfully');
    console.log('   Email: tech@example.com');
    console.log('   Password: Tech@123456789');

    console.log('\n✅ Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
}

seedDatabase();
