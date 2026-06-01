const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialRecord = sequelize.define('FinancialRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    machineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('purchase', 'maintenance', 'repair', 'service', 'other'),
      defaultValue: 'other',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  }, {
    tableName: 'financial_records',
    timestamps: true,
  });

  return FinancialRecord;
};
