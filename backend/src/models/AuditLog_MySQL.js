const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45), // IPv6 compatible
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('success', 'failure'),
      defaultValue: 'success',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  });

  return AuditLog;
};
