const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Maintenance = sequelize.define('Maintenance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    machineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('preventive', 'corrective', 'inspection'),
      defaultValue: 'preventive',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maintenanceDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    workedDays: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of dates worked on maintenance',
    },
    technician: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    panneId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'maintenance',
    timestamps: true,
  });

  return Maintenance;
};
