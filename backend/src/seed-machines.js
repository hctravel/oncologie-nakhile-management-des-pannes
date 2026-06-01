require('dotenv').config();
const { sequelize, MedicalMachine, User } = require('./models');

async function seedMachines() {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database');

    // Get admin user
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      console.error('Admin user not found. Please seed users first.');
      process.exit(1);
    }

    // Clear existing machines
    await MedicalMachine.destroy({ where: {} });
    console.log('Cleared existing machines');

    // Create sample machines
    const machines = [
      {
        name: 'CT Scanner',
        type: 'Imaging',
        serialNumber: 'SN12345',
        status: 'operational',
        location: 'Salle A',
        manufacturer: 'SIEMENS',
        purchaseDate: new Date('2020-06-15'),
        description: 'Computed Tomography Scanner',
        price: 500000,
        createdBy: admin.id,
      },
      {
        name: 'MRI Machine',
        type: 'Imaging',
        serialNumber: 'SN12346',
        status: 'operational',
        location: 'Salle B',
        manufacturer: 'GE',
        purchaseDate: new Date('2021-03-20'),
        description: 'Magnetic Resonance Imaging Machine',
        price: 750000,
        createdBy: admin.id,
      },
      {
        name: 'Ultrasound Machine',
        type: 'Diagnostic',
        serialNumber: 'SN12347',
        status: 'operational',
        location: 'Salle C',
        manufacturer: 'Philips',
        purchaseDate: new Date('2022-01-10'),
        description: 'Portable Ultrasound System',
        price: 250000,
        createdBy: admin.id,
      },
      {
        name: 'X-Ray Machine',
        type: 'Imaging',
        serialNumber: 'SN12348',
        status: 'maintenance',
        location: 'Salle D',
        manufacturer: 'Siemens',
        purchaseDate: new Date('2019-05-20'),
        description: 'Digital X-Ray Imaging System',
        price: 350000,
        createdBy: admin.id,
      },
      {
        name: 'ECG Machine',
        type: 'Cardiac',
        serialNumber: 'SN12349',
        status: 'operational',
        location: 'Urgence',
        manufacturer: 'Philips',
        purchaseDate: new Date('2023-02-14'),
        description: 'Electrocardiograph Machine',
        price: 45000,
        createdBy: admin.id,
      },
      {
        name: 'Defibrillator',
        type: 'Emergency',
        serialNumber: 'SN12350',
        status: 'operational',
        location: 'Urgence',
        manufacturer: 'Zoll',
        purchaseDate: new Date('2022-11-30'),
        description: 'Automated External Defibrillator',
        price: 35000,
        createdBy: admin.id,
      },
    ];

    await MedicalMachine.bulkCreate(machines);
    console.log(`✅ ${machines.length} machines seeded successfully`);

    console.log('\n🏥 Machines Created:');
    machines.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} (${m.type}) - ${m.status}`);
    });

    console.log('\n✅ Machine seeding completed');
  } catch (error) {
    console.error('Error seeding machines:', error);
    process.exit(1);
  }
}

seedMachines();
