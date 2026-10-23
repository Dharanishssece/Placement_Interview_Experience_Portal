const mongoose = require('mongoose');

const prepTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['DSA & Coding', 'Core Subjects (OS/DBMS/CN)', 'System Design', 'Aptitude', 'Company Questions', 'Resume & Projects', 'HR & Behavioral'],
    default: 'DSA & Coding',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const preparationTrackerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      default: 'Software Development Engineer',
    },
    targetDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    tasks: [prepTaskSchema],
  },
  {
    timestamps: true,
  }
);

// Unique tracker per student and target company
preparationTrackerSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

const PreparationTracker = mongoose.model('PreparationTracker', preparationTrackerSchema);

module.exports = PreparationTracker;
