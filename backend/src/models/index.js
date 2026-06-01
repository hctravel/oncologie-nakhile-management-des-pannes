const { sequelize, Sequelize } = require('../config/database');

// Import all models
const User = require('./User_MySQL')(sequelize);
const MedicalMachine = require('./MedicalMachine_MySQL')(sequelize);
const Panne = require('./Panne_MySQL')(sequelize);
const Maintenance = require('./Maintenance_MySQL')(sequelize);
const MachineUsage = require('./MachineUsage_MySQL')(sequelize);
const FinancialRecord = require('./FinancialRecord_MySQL')(sequelize);
const AuditLog = require('./AuditLog_MySQL')(sequelize);

// Define associations
User.hasMany(User, {
  foreignKey: 'createdBy',
  as: 'createdUsers',
});

User.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

// Machine associations
MedicalMachine.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

MedicalMachine.hasMany(Panne, {
  foreignKey: 'machineId',
  as: 'pannes',
});

MedicalMachine.hasMany(Maintenance, {
  foreignKey: 'machineId',
  as: 'maintenances',
});

MedicalMachine.hasMany(MachineUsage, {
  foreignKey: 'machineId',
  as: 'usages',
});

MedicalMachine.hasMany(FinancialRecord, {
  foreignKey: 'machineId',
  as: 'financialRecords',
});

// Panne associations
Panne.belongsTo(MedicalMachine, {
  foreignKey: 'machineId',
  as: 'machine',
});

Panne.belongsTo(User, {
  foreignKey: 'reportedBy',
  as: 'reportedByUser',
});

Panne.belongsTo(User, {
  foreignKey: 'assignedTechnician',
  as: 'assignedTechnicianUser',
});

// Maintenance associations
Maintenance.belongsTo(MedicalMachine, {
  foreignKey: 'machineId',
  as: 'machine',
});

Maintenance.belongsTo(User, {
  foreignKey: 'recordedBy',
  as: 'recordedByUser',
});

// MachineUsage associations
MachineUsage.belongsTo(MedicalMachine, {
  foreignKey: 'machineId',
  as: 'machine',
});

MachineUsage.belongsTo(User, {
  foreignKey: 'recordedBy',
  as: 'recordedByUser',
});

// FinancialRecord associations
FinancialRecord.belongsTo(MedicalMachine, {
  foreignKey: 'machineId',
  as: 'machine',
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  MedicalMachine,
  Panne,
  Maintenance,
  MachineUsage,
  FinancialRecord,
  AuditLog,
};
