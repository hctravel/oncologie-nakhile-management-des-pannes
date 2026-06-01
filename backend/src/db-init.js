require('dotenv').config();
const { sequelize, User } = require('./models');

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MySQL database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully\n');

    console.log('🔄 Synchronizing database schema...');
    
    // Use alter: true to safely add new columns without dropping tables
    // This ensures schema is always up-to-date with model definitions
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database schema synchronized\n');

    console.log('🔄 Creating default users...');

    // Check if superadmin exists
    const superadminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!superadminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123456789',
        role: 'super admin',
        phoneNumber: '+1234567890',
        department: 'Administration',
        isActive: true,
      });
      console.log('✅ Super Admin user created successfully');
      console.log('   Email: admin@example.com');
      console.log('   Password: Admin@123456789');
    } else {
      console.log('✓ Super Admin user already exists');
    }

    // Check if sample admin exists
    const sampleAdminExists = await User.findOne({ where: { email: 'admin2@example.com' } });
    
    if (!sampleAdminExists) {
      await User.create({
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
    } else {
      console.log('✓ Sample admin user already exists');
    }

    // Check if technician exists
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
      console.log('✅ Technician user created successfully');
      console.log('   Email: tech@example.com');
      console.log('   Password: Tech@123456789');
    } else {
      console.log('✓ Technician user already exists');
    }

    console.log('\n✅ Database initialization completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:');
    console.error(error.message);
    process.exit(1);
  }
}

initializeDatabase();
