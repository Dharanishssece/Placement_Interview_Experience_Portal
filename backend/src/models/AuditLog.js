const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String, // e.g. "STUDENT_DELETED", "PLACEMENT_VERIFIED", "EXPERIENCE_APPROVED", "COMPANY_CREATED"
      required: true,
      index: true,
    },
    targetType: {
      type: String, // e.g. "User", "Company", "PlacementRecord", "InterviewExperience"
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    changeSummary: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
