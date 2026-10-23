const mongoose = require('mongoose');

const jobRoleSubSchema = new mongoose.Schema({
  roleTitle: {
    type: String,
    required: true,
    trim: true,
  },
  ctc: {
    type: Number, // in LPA, e.g. 14.5
    default: 0,
  },
  ctcDisplay: {
    type: String, // e.g. "14.5 LPA" or "8 - 12 LPA"
    trim: true,
  },
  vacancies: {
    type: Number,
    default: 0,
  },
  jobDescription: {
    type: String,
    default: '',
  },
});

const placementDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g. 2025-2026)'],
      trim: true,
      index: true,
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    jobRoles: [jobRoleSubSchema],
    eligibleDepartments: {
      type: [String],
      default: ['CSE', 'IT', 'ECE'],
    },
    minCgpa: {
      type: Number,
      default: 6.5,
    },
    recruitmentStatus: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    selectionRounds: {
      type: [String],
      default: ['Aptitude & Online Assessment', 'Technical Interview 1', 'HR & Managerial Round'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure efficient lookup and prevent identical drives for same company in same academic year and date
placementDriveSchema.index({ companyId: 1, academicYear: 1, driveDate: 1 });

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);

module.exports = PlacementDrive;
