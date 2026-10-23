const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  answerExplanation: {
    type: String,
    default: '',
  },
  topic: {
    type: String,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
});

const interviewRoundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  roundName: {
    type: String,
    required: true,
  },
  roundType: {
    type: String,
    enum: ['Aptitude', 'Coding', 'Technical', 'HR', 'Managerial', 'Group Discussion', 'System Design'],
    default: 'Technical',
  },
  duration: {
    type: String,
    default: '45 mins',
  },
  description: {
    type: String,
    default: '',
  },
  questions: [questionSchema],
});

const pdfAttachmentSchema = new mongoose.Schema({
  originalName: { type: String, default: '' },
  filename: { type: String, default: '' },
  filePath: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

const interviewExperienceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student author reference is required'],
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
    selectionYear: {
      type: String,
      required: [true, 'Selection year is required'],
      trim: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Very Hard'],
      default: 'Medium',
    },
    overallExperience: {
      type: String,
      required: [true, 'Overall experience narrative is required'],
    },
    preparationStrategy: {
      type: String,
      required: [true, 'Preparation strategy is required'],
    },
    tips: {
      type: String,
      default: '',
    },
    rounds: [interviewRoundSchema],
    pdfAttachment: {
      type: pdfAttachmentSchema,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Rejected'],
      default: 'Pending Review',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate submissions for the same student and drive
interviewExperienceSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);

module.exports = InterviewExperience;
