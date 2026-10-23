const mongoose = require('mongoose');

const placementRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
      index: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    packageCTC: {
      type: Number, // in LPA
      required: [true, 'Salary package (CTC in LPA) is required'],
      min: 0,
    },
    packageDisplay: {
      type: String,
      trim: true,
      default: '',
    },
    selectionDate: {
      type: Date,
      default: Date.now,
    },
    offerStatus: {
      type: String,
      enum: ['Offered', 'Accepted', 'Declined', 'Joined'],
      default: 'Offered',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Revoked'],
      default: 'Pending',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent accidental duplicate placement record for the exact same student, company and drive
placementRecordSchema.index(
  { studentId: 1, companyId: 1, driveId: 1 },
  { unique: true }
);

const PlacementRecord = mongoose.model('PlacementRecord', placementRecordSchema);

module.exports = PlacementRecord;
