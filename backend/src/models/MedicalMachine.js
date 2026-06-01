const mongoose = require('mongoose');

const medicalMachineSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a machine name'],
      trim: true,
      maxlength: [100, 'Machine name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide serial number'],
      unique: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'broken', 'decommissioned'],
      default: 'operational',
    },
    location: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      default: '',
    },
    warrantyExpiryDate: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
medicalMachineSchema.index({ status: 1 });
medicalMachineSchema.index({ createdBy: 1 });
medicalMachineSchema.index({ serialNumber: 1 });

module.exports = mongoose.model('MedicalMachine', medicalMachineSchema);
