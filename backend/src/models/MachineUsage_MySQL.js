const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MachineUsage = sequelize.define('MachineUsage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    machineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usageDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'machine_usage',
    timestamps: true,
  });

  return MachineUsage;
};
