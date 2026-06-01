require('dotenv').config();
const { sequelize, User, MedicalMachine, FinancialRecord } = require('./models');

async function seedFinancialData() {
  try {
    // Connect to MySQL using Sequelize
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL Database');

    // Get a user to associate with records
    let user = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!user) {
      console.error('❌ Admin user not found. Please seed users first.');
      process.exit(1);
    }

    // Get a machine to associate with records
    let machine = await MedicalMachine.findOne();
    if (!machine) {
      console.error('❌ No machines found. Please create machines first.');
      process.exit(1);
    }

    // Clear existing financial records
    await FinancialRecord.destroy({ where: {} });
    console.log('🗑️  Cleared existing financial records');

    // Create sample financial records
    const records = [
      {
        machineId: machine.id,
        recordType: 'revenue',
        amount: 500,
        description: 'Machine rental income',
        recordDate: new Date('2026-01-01'),
        recordedBy: user.id,
      },
      {
        machineId: machine.id,
        recordType: 'revenue',
        amount: 450,
        description: 'Machine rental income',
        recordDate: new Date('2026-01-05'),
        recordedBy: user.id,
      },
      {
        machineId: machine.id,
        recordType: 'maintenance_cost',
        amount: 100,
        description: 'Routine maintenance cost',
        recordDate: new Date('2026-01-08'),
        recordedBy: user.id,
      },
      {
        machineId: machine.id,
        recordType: 'revenue',
        amount: 520,
        description: 'Machine rental income',
        recordDate: new Date('2026-01-12'),
        recordedBy: user.id,
      },
      {
        machineId: machine.id,
        recordType: 'panne_cost',
        amount: 250,
        description: 'Breakdown repair cost',
        recordDate: new Date('2026-01-15'),
        recordedBy: user.id,
      },
      {
        machineId: machine.id,
        recordType: 'revenue',
        amount: 480,
        description: 'Machine rental income',
        recordDate: new Date('2026-01-20'),
        recordedBy: user.id,
      },
      {
        machineId: machine.id,
        recordType: 'maintenance_cost',
        amount: 120,
        description: 'Preventive maintenance cost',
        recordDate: new Date('2026-01-22'),
        recordedBy: user.id,
      },
    ];

    await FinancialRecord.bulkCreate(records);
    console.log(`✅ ${records.length} financial records seeded successfully`);

    console.log('\n📊 Financial Records Created:');
    records.forEach((r, i) => {
      console.log(`${i + 1}. ${r.recordType.toUpperCase()}: $${r.amount} - ${r.description} (${new Date(r.recordDate).toLocaleDateString()})`);
    });

    console.log('\n✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding financial data:', error.message);
    process.exit(1);
  }
}

seedFinancialData();
