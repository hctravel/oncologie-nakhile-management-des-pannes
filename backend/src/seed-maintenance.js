require('dotenv').config();
const { sequelize, Maintenance, MedicalMachine, User } = require('./models');

async function seedMaintenance() {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    // Get users
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    const tech = await User.findOne({ where: { email: 'tech@example.com' } });
    if (!admin || !tech) {
      console.error('Admin or technician user not found. Please seed users first.');
      process.exit(1);
    }

    // Get machines
    const machines = await MedicalMachine.findAll({ limit: 6 });
    if (machines.length === 0) {
      console.error('No machines found. Please seed machines first.');
      process.exit(1);
    }

    // Clear existing maintenance records
    await Maintenance.destroy({ where: {} });
    console.log('Cleared existing maintenance records');

    // Create sample maintenance records
    const maintenanceRecords = [
      {
        machineId: machines[0].id,
        technician: 'Technician Mohammed',
        maintenanceDate: new Date('2026-01-05'),
        type: 'preventive',
        description: 'Regular inspection and cleaning',
        cost: 150,
        status: 'completed',
        notes: 'Machine operating normally',
        recordedBy: admin.id,
      },
      {
        machineId: machines[0].id,
        technician: 'Technician Ahmed',
        maintenanceDate: new Date('2026-01-18'),
        type: 'preventive',
        description: 'Oil change and filter replacement',
        cost: 200,
        status: 'completed',
        notes: 'All filters replaced successfully',
        recordedBy: admin.id,
      },
      {
        machineId: machines[1].id,
        technician: 'Technician Mohammed',
        maintenanceDate: new Date('2026-01-10'),
        type: 'corrective',
        description: 'Sensor replacement',
        cost: 300,
        status: 'completed',
        notes: 'Faulty sensor replaced with new one',
        recordedBy: admin.id,
      },
      {
        machineId: machines[1].id,
        technician: 'Technician Hassan',
        maintenanceDate: new Date('2026-01-25'),
        type: 'preventive',
        description: 'Calibration check',
        cost: 250,
        status: 'scheduled',
        notes: 'Scheduled for calibration',
        recordedBy: admin.id,
      },
      {
        machineId: machines[2].id,
        technician: 'Technician Ahmed',
        maintenanceDate: new Date('2026-01-12'),
        type: 'inspection',
        description: 'Urgent bearing replacement',
        cost: 500,
        status: 'completed',
        notes: 'Bearing failure detected and replaced',
        recordedBy: admin.id,
      },
      {
        machineId: machines[2].id,
        technician: 'Technician Mohammed',
        maintenanceDate: new Date('2026-01-28'),
        type: 'preventive',
        description: 'Annual service',
        cost: 400,
        status: 'in_progress',
        notes: 'Annual maintenance in progress',
        recordedBy: admin.id,
      },
      {
        machineId: machines[3].id,
        technician: 'Technician Hassan',
        maintenanceDate: new Date('2026-02-03'),
        type: 'corrective',
        description: 'Fan motor repair',
        cost: 350,
        status: 'completed',
        notes: 'Replaced bearing in fan motor',
        recordedBy: admin.id,
      },
      {
        machineId: machines[3].id,
        technician: 'Technician Ahmed',
        maintenanceDate: new Date('2026-02-08'),
        type: 'preventive',
        description: 'Maintenance inspection',
        cost: 180,
        status: 'scheduled',
        notes: 'Quarterly inspection due',
        recordedBy: admin.id,
      },
      {
        machineId: machines[4].id,
        technician: 'Technician Mohammed',
        maintenanceDate: new Date('2026-01-30'),
        type: 'preventive',
        description: 'Electrode replacement',
        cost: 120,
        status: 'completed',
        notes: 'All electrode replacements completed',
        recordedBy: admin.id,
      },
      {
        machineId: machines[5].id,
        technician: 'Technician Hassan',
        maintenanceDate: new Date('2026-02-10'),
        type: 'preventive',
        description: 'Battery check and maintenance',
        cost: 90,
        status: 'scheduled',
        notes: 'Battery performance check pending',
        recordedBy: admin.id,
      },
    ];

    await Maintenance.bulkCreate(maintenanceRecords);
    console.log(`✅ ${maintenanceRecords.length} maintenance records seeded successfully`);

    console.log('\n🔧 Maintenance Records Created:');
    const records = await Maintenance.findAll({ include: [{ model: MedicalMachine, as: 'machine' }] });
    records.forEach((r, i) => {
      console.log(`${i + 1}. ${r.machine.name} - ${r.type.toUpperCase()} (${r.status}) - ${r.description}`);
    });

    console.log('\n✅ Maintenance seeding completed');
  } catch (error) {
    console.error('Error seeding maintenance:', error);
    process.exit(1);
  }
}

seedMaintenance();

seedMaintenance();
