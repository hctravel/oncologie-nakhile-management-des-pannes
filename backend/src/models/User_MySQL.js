const { DataTypes } = require('sequelize');
const bcryptjs = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a name',
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: {
        name: 'email_unique',
        msg: 'Email already exists',
      },
      lowercase: true,
      validate: {
        notEmpty: {
          msg: 'Please provide an email',
        },
        isEmail: {
          msg: 'Please provide a valid email',
        },
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a password',
        },
        len: {
          args: [12],
          msg: 'Password must be at least 12 characters',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'technician', 'admin', 'super admin', 'reception'),
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['user', 'technician', 'admin', 'super admin', 'reception']],
          msg: 'Invalid role',
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        // SECURITY: Validate phone format
        isNumeric: {
          msg: 'Phone number should contain only numbers',
        },
      },
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: false,
    hooks: {
      // SECURITY: Hash password before saving
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
    },
  });

  // SECURITY: Virtual to check if account is locked
  User.prototype.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  // SECURITY: Method to compare passwords
  User.prototype.matchPassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
  };

  // SECURITY: Method to increment login attempts
  User.prototype.incLoginAttempts = async function () {
    const maxAttempts = 3;
    const lockTimeInMinutes = 5;

    // Reset attempts if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        loginAttempts: 1,
        lockUntil: null,
      });
    }

    const updates = { loginAttempts: this.loginAttempts + 1 };

    // Lock the account after max attempts
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
      updates.lockUntil = new Date(Date.now() + lockTimeInMinutes * 60 * 1000);
    }

    return this.update(updates);
  };

  // SECURITY: Method to reset login attempts
  User.prototype.resetLoginAttempts = async function () {
    return this.update({
      loginAttempts: 0,
      lockUntil: null,
    });
  };

  return User;
};
