const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewExperience',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmark for same student and experience
bookmarkSchema.index({ studentId: 1, experienceId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
