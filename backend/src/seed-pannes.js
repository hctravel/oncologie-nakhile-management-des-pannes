require('dotenv').config();
const { sequelize, Panne, MedicalMachine, User } = require('./models');

async function seedPannes() {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    // Get users
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      console.error('Admin user not found. Please seed users first.');
      process.exit(1);
    }

    // Get machines
    const machines = await MedicalMachine.findAll({ limit: 6 });
    if (machines.length === 0) {
      console.error('No machines found. Please seed machines first.');
      process.exit(1);
    }

    // Clear existing pannes
    await Panne.destroy({ where: {} });
    console.log('Cleared existing breakdown records');

    // Create sample breakdown records
    const pannes = [
      {
        machineId: machines[0].id,
        description: 'Fan motor not working properly',
        status: 'reported',
        reportDate: new Date('2026-01-03'),
        reportedBy: admin.id,
        notes: 'Intermittent noise from fan unit',
        cost: 5000,
      },
      {
        machineId: machines[0].id,
        description: 'Display screen flickering',
        status: 'in_progress',
        reportDate: new Date('2026-01-08'),
        reportedBy: admin.id,
        notes: 'Technician assigned for repair',
        cost: 3000,
      },
      {
        machineId: machines[1].id,
        description: 'Power supply malfunction',
        status: 'reported',
        reportDate: new Date('2026-01-06'),
        reportedBy: admin.id,
        notes: 'Machine not turning on',
        cost: 15000,
      },
      {
        machineId: machines[1].id,
        description: 'Cooling system leak',
        status: 'resolved',
        reportDate: new Date('2026-01-12'),
        reportedBy: admin.id,
        notes: 'Coolant line replaced',
        cost: 8500,
        resolvedDate: new Date('2026-01-15'),
      },
      {
        machineId: machines[2].id,
        description: 'Sensor calibration issue',
        status: 'reported',
        reportDate: new Date('2026-01-14'),
        reportedBy: admin.id,
        notes: 'Readings showing incorrect values',
        cost: 2000,
      },
      {
        machineId: machines[2].id,
        description: 'Strange vibration during operation',
        status: 'in_progress',
        reportDate: new Date('2026-01-19'),
        reportedBy: admin.id,
        notes: 'Bearing inspection scheduled',
        cost: 6000,
      },
      {
        machineId: machines[3].id,
        description: 'Overheating during operation',
        status: 'reported',
        reportDate: new Date('2026-02-01'),
        reportedBy: admin.id,
        notes: 'Machine shuts down after 30 minutes',
        cost: 12000,
      },
      {
        machineId: machines[4].id,
        description: 'Battery not charging',
        status: 'resolved',
        reportDate: new Date('2026-01-20'),
        reportedBy: admin.id,
        notes: 'Replaced battery pack',
        cost: 1500,
        resolvedDate: new Date('2026-01-22'),
      },
      {
        machineId: machines[5].id,
        description: 'Electrode pads defective',
        status: 'reported',
        reportDate: new Date('2026-02-05'),
        reportedBy: admin.id,
        notes: 'Poor contact with patient skin',
        cost: 500,
      },
    ];

    await Panne.bulkCreate(pannes);
    console.log(`✅ ${pannes.length} breakdown records seeded successfully`);

    console.log('\n🔧 Breakdown Records Created:');
    const records = await Panne.findAll({ include: [{ model: MedicalMachine, as: 'machine' }] });
    records.forEach((r, i) => {
      console.log(`${i + 1}. ${r.machine.name} - ${r.status} - ${r.description}`);
    });

    console.log('\n✅ Breakdown seeding completed');
  } catch (error) {
    console.error('Error seeding pannes:', error);
    process.exit(1);
  }
}

seedPannes();
