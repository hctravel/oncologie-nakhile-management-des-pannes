require('dotenv').config();
const { sequelize, MachineUsage, MedicalMachine, User } = require('./models');

async function seedMachineUsage() {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    // Get a user to associate with records
    let user = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!user) {
      console.error('Admin user not found. Please seed users first.');
      process.exit(1);
    }

    // Get machines to associate with records
    const machines = await MedicalMachine.findAll({ limit: 6 });
    if (machines.length === 0) {
      console.error('No machines found. Please seed machines first.');
      process.exit(1);
    }

    // Clear existing usage records
    await MachineUsage.destroy({ where: {} });
    console.log('Cleared existing usage records');

    // Create sample usage records
    const records = [];
    const usageTypes = ['Consultation', 'Examen', 'Diagnostic', 'Scan', 'Monitoring', 'Treatment'];
    
    for (let i = 0; i < machines.length; i++) {
      // Add 8 usage records per machine
      for (let j = 0; j < 8; j++) {
        const date = new Date(2026, 0, j + 1 + (i * 2));
        records.push({
          machineId: machines[i].id,
          usageDate: date,
          quantity: Math.floor(Math.random() * 20) + 5,
          unitPrice: Math.floor(Math.random() * 5000) + 500,
          notes: usageTypes[Math.floor(Math.random() * usageTypes.length)],
          recordedBy: user.id,
        });
      }
    }

    await MachineUsage.bulkCreate(records);
    console.log(`✅ ${records.length} usage records seeded successfully`);

    console.log('\n📊 Usage Records Created:');
    const usageRecords = await MachineUsage.findAll({ 
      include: [{ model: MedicalMachine, as: 'machine' }],
      limit: 10
    });
    usageRecords.forEach((r, i) => {
      console.log(`${i + 1}. ${r.machine.name} - Qty: ${r.quantity}, Unit: ${r.unitPrice} MAD, Total: ${r.quantity * r.unitPrice} MAD (${new Date(r.usageDate).toLocaleDateString()})`);
    });

    console.log('\n✅ Machine usage seeding completed');
  } catch (error) {
    console.error('Error seeding machine usage:', error);
    process.exit(1);
  }
}

seedMachineUsage();
