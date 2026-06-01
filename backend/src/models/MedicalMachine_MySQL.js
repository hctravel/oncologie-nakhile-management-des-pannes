const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalMachine = sequelize.define('MedicalMachine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('operational', 'maintenance', 'broken', 'retired'),
      defaultValue: 'operational',
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    warrantyUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    warrantyExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'medical_machines',
    timestamps: true,
  });

  return MedicalMachine;
};
