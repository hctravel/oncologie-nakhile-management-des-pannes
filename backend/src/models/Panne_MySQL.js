const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Panne = sequelize.define('Panne', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codePanne: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'Custom code for panne (user-defined)',
    },
    machineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instantPanne: {
      type: DataTypes.ENUM('Au cour TTT', 'Hors TTT'),
      allowNull: true,
      comment: 'Instant du panne: During treatment or outside treatment',
    },
    status: {
      type: DataTypes.ENUM('reported', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'reported',
    },
    reportedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assignedTechnician: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    reportDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resolvedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  }, {
    tableName: 'pannes',
    timestamps: true,
  });

  return Panne;
};
