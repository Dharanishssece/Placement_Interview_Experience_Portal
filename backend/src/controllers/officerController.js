const User = require('../models/User');
const PlacementRecord = require('../models/PlacementRecord');
const InterviewExperience = require('../models/InterviewExperience');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get Placement Officer Dashboard Statistics
 * @route   GET /api/officer/dashboard-stats
 * @access  Private (placement_officer)
 */
const getOfficerDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', accountStatus: 'active' });
    const suspendedStudents = await User.countDocuments({ role: 'student', accountStatus: 'suspended' });

    const totalVerifiedOffers = await PlacementRecord.countDocuments({ verificationStatus: 'Verified' });
    const pendingVerifications = await PlacementRecord.countDocuments({ verificationStatus: 'Pending' });

    const uniquePlaced = (await PlacementRecord.distinct('studentId', { verificationStatus: 'Verified' })).length;
    const unplacedStudents = Math.max(0, totalStudents - uniquePlaced);

    const pendingExperiences = await InterviewExperience.countDocuments({ status: 'Pending Review' });
    const approvedExperiences = await InterviewExperience.countDocuments({ status: 'Approved' });
    const rejectedExperiences = await InterviewExperience.countDocuments({ status: 'Rejected' });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        suspendedStudents,
        totalVerifiedOffers,
        pendingVerifications,
        uniquePlaced,
        unplacedStudents,
        pendingExperiences,
        approvedExperiences,
        rejectedExperiences,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get registered student directory with search, filter, pagination
 * @route   GET /api/officer/students
 * @access  Private (placement_officer, placement_director)
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, department, accountStatus, placementStatus, page = 1, limit = 15, sort = 'rollNumber' } = req.query;

    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (accountStatus && accountStatus !== 'All') {
      query.accountStatus = accountStatus;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    if (sort === 'name') sortOption.name = 1;
    else if (sort === 'rollNumber') sortOption.rollNumber = 1;
    else if (sort === 'createdAt') sortOption.createdAt = -1;
    else sortOption.rollNumber = 1;

    let students = await User.find(query).sort(sortOption).skip(skip).limit(limitNum).lean();
    const totalCount = await User.countDocuments(query);

    // Enhance students with placement and experience counts
    const enhancedStudents = await Promise.all(
      students.map(async (student) => {
        const placements = await PlacementRecord.find({ studentId: student._id })
          .populate('companyId', 'name')
          .lean();

        const verifiedOffers = placements.filter((p) => p.verificationStatus === 'Verified');
        const pendingOffers = placements.filter((p) => p.verificationStatus === 'Pending');

        const submittedExperiences = await InterviewExperience.countDocuments({ studentId: student._id });

        return {
          ...student,
          totalOffers: placements.length,
          verifiedOffersCount: verifiedOffers.length,
          pendingOffersCount: pendingOffers.length,
          placedCompanies: verifiedOffers.map((p) => p.companyId?.name).filter(Boolean),
          isPlaced: verifiedOffers.length > 0,
          submittedExperiencesCount: submittedExperiences,
        };
      })
    );

    // Filter by placementStatus in memory if requested
    let finalStudents = enhancedStudents;
    if (placementStatus && placementStatus !== 'All') {
      if (placementStatus === 'Placed') {
        finalStudents = enhancedStudents.filter((s) => s.isPlaced);
      } else if (placementStatus === 'Unplaced') {
        finalStudents = enhancedStudents.filter((s) => !s.isPlaced);
      } else if (placementStatus === 'Pending Verification') {
        finalStudents = enhancedStudents.filter((s) => s.pendingOffersCount > 0);
      }
    }

    res.status(200).json({
      success: true,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      students: finalStudents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed student profile
 * @route   GET /api/officer/students/:id
 * @access  Private (placement_officer, placement_director)
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-passwordHash');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const placements = await PlacementRecord.find({ studentId: student._id })
      .populate('companyId', 'name industry website logoUrl')
      .populate('driveId', 'academicYear driveDate recruitmentStatus')
      .populate('verifiedBy', 'name email')
      .sort({ selectionDate: -1 });

    const experiences = await InterviewExperience.find({ studentId: student._id })
      .populate('companyId', 'name')
      .populate('driveId', 'academicYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student,
      placements,
      experiences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student information
 * @route   PUT /api/officer/students/:id
 * @access  Private (placement_officer)
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const { name, department, phone, batch, cgpa, accountStatus } = req.body;

    if (name) student.name = name.trim();
    if (department) student.department = department.trim();
    if (phone !== undefined) student.phone = phone.trim();
    if (batch) student.batch = batch.trim();
    if (cgpa !== undefined) student.cgpa = Number(cgpa);
    if (accountStatus) student.accountStatus = accountStatus;

    await student.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'STUDENT_UPDATED',
      targetType: 'User',
      targetId: student._id,
      changeSummary: `Placement Officer updated profile for student: ${student.name} (${student.rollNumber}).`,
    });

    res.status(200).json({
      success: true,
      message: 'Student information updated successfully.',
      student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle student account status (suspend/reactivate)
 * @route   PUT /api/officer/students/:id/status
 * @access  Private (placement_officer)
 */
const toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    student.accountStatus = student.accountStatus === 'active' ? 'suspended' : 'active';
    await student.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'STUDENT_STATUS_TOGGLED',
      targetType: 'User',
      targetId: student._id,
      changeSummary: `Changed status of student ${student.rollNumber} to ${student.accountStatus}.`,
    });

    res.status(200).json({
      success: true,
      message: `Student account has been ${student.accountStatus}.`,
      accountStatus: student.accountStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student record with historical checks & warning
 * @route   DELETE /api/officer/students/:id
 * @access  Private (placement_officer)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const { forceDelete } = req.body;

    const placementCount = await PlacementRecord.countDocuments({ studentId: student._id });
    const experienceCount = await InterviewExperience.countDocuments({ studentId: student._id });

    if ((placementCount > 0 || experienceCount > 0) && !forceDelete) {
      return res.status(400).json({
        success: false,
        requiresConfirmation: true,
        message: `Student ${student.name} has ${placementCount} placement record(s) and ${experienceCount} interview experience(s). Deleting will remove these linked records. Confirm deletion with forceDelete: true.`,
      });
    }

    // Remove linked records if confirmed
    await PlacementRecord.deleteMany({ studentId: student._id });
    await InterviewExperience.deleteMany({ studentId: student._id });
    await User.findByIdAndDelete(student._id);

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'STUDENT_DELETED',
      targetType: 'User',
      targetId: student._id,
      changeSummary: `Placement Officer permanently deleted student ${student.name} (${student.rollNumber}) and associated records.`,
    });

    res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.rollNumber}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all placement records (with search & filter)
 * @route   GET /api/officer/placements
 * @access  Private (placement_officer, placement_director)
 */
const getPlacementRecords = async (req, res, next) => {
  try {
    const { companyId, driveId, verificationStatus, department } = req.query;

    const query = {};
    if (companyId) query.companyId = companyId;
    if (driveId) query.driveId = driveId;
    if (verificationStatus && verificationStatus !== 'All') query.verificationStatus = verificationStatus;

    const records = await PlacementRecord.find(query)
      .populate('studentId', 'name rollNumber department email phone batch')
      .populate('companyId', 'name industry tier website logoUrl')
      .populate('driveId', 'academicYear driveDate recruitmentStatus')
      .populate('verifiedBy', 'name email')
      .sort({ selectionDate: -1 });

    const filtered = department && department !== 'All'
      ? records.filter((r) => r.studentId?.department === department)
      : records;

    res.status(200).json({
      success: true,
      count: filtered.length,
      records: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create placement record (Associate student with company and drive)
 * @route   POST /api/officer/placements
 * @access  Private (placement_officer)
 */
const createPlacementRecord = async (req, res, next) => {
  try {
    const { studentId, companyId, driveId, jobRole, packageCTC, packageDisplay, selectionDate, offerStatus, verificationStatus, remarks } = req.body;

    if (!studentId || !companyId || !driveId || !jobRole || packageCTC === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student, company, drive, job role, and package CTC.',
      });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Referenced student not found.' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Referenced company not found.' });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Referenced placement drive not found.' });
    }

    // Check duplicate
    const existing = await PlacementRecord.findOne({ studentId, companyId, driveId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A placement record for ${student.name} in ${company.name} (${drive.academicYear}) already exists.`,
      });
    }

    const isVerified = verificationStatus === 'Verified';

    const record = await PlacementRecord.create({
      studentId,
      companyId,
      driveId,
      jobRole: jobRole.trim(),
      packageCTC: Number(packageCTC),
      packageDisplay: packageDisplay || `${packageCTC} LPA`,
      selectionDate: selectionDate ? new Date(selectionDate) : new Date(),
      offerStatus: offerStatus || 'Offered',
      verificationStatus: verificationStatus || 'Pending',
      verifiedBy: isVerified ? req.user._id : null,
      verifiedAt: isVerified ? new Date() : null,
      remarks: remarks || '',
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PLACEMENT_RECORD_CREATED',
      targetType: 'PlacementRecord',
      targetId: record._id,
      changeSummary: `Officer recorded placement for ${student.name} (${student.rollNumber}) at ${company.name}. Verification status: ${record.verificationStatus}.`,
    });

    const populatedRecord = await PlacementRecord.findById(record._id)
      .populate('studentId', 'name rollNumber department email')
      .populate('companyId', 'name')
      .populate('driveId', 'academicYear')
      .populate('verifiedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Placement record created successfully.',
      record: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or Revoke placement record
 * @route   PUT /api/officer/placements/:id/verify
 * @access  Private (placement_officer)
 */
const verifyPlacement = async (req, res, next) => {
  try {
    const { status, remarks } = req.body; // 'Verified', 'Revoked', 'Pending'

    const record = await PlacementRecord.findById(req.params.id)
      .populate('studentId', 'name rollNumber')
      .populate('companyId', 'name');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Placement record not found.' });
    }

    record.verificationStatus = status;
    if (status === 'Verified') {
      record.verifiedBy = req.user._id;
      record.verifiedAt = new Date();
    } else {
      record.verifiedBy = null;
      record.verifiedAt = null;
    }
    if (remarks !== undefined) record.remarks = remarks;

    await record.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: `PLACEMENT_${status.toUpperCase()}`,
      targetType: 'PlacementRecord',
      targetId: record._id,
      changeSummary: `Placement Officer updated verification status for ${record.studentId?.name} at ${record.companyId?.name} to "${status}".`,
    });

    res.status(200).json({
      success: true,
      message: `Placement record successfully updated to "${status}".`,
      record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete placement record
 * @route   DELETE /api/officer/placements/:id
 * @access  Private (placement_officer)
 */
const deletePlacementRecord = async (req, res, next) => {
  try {
    const record = await PlacementRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Placement record not found.' });
    }

    await PlacementRecord.findByIdAndDelete(record._id);

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PLACEMENT_RECORD_DELETED',
      targetType: 'PlacementRecord',
      targetId: record._id,
      changeSummary: `Placement Officer removed placement record for student ${record.studentId}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Placement record removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get experience moderation list
 * @route   GET /api/officer/moderation
 * @access  Private (placement_officer)
 */
const getModerationQueue = async (req, res, next) => {
  try {
    const { status = 'All' } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const experiences = await InterviewExperience.find(query)
      .populate('studentId', 'name rollNumber department email phone')
      .populate('companyId', 'name industry website logoUrl')
      .populate('driveId', 'academicYear driveDate')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: experiences.length,
      experiences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or Reject interview experience
 * @route   PUT /api/officer/moderation/:id
 * @access  Private (placement_officer)
 */
const moderateExperience = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Approved" or "Rejected".',
      });
    }

    if (status === 'Rejected' && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory when rejecting a submission.',
      });
    }

    const experience = await InterviewExperience.findById(req.params.id)
      .populate('studentId', 'name rollNumber')
      .populate('companyId', 'name');

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Interview experience submission not found.' });
    }

    experience.status = status;
    experience.reviewedBy = req.user._id;
    experience.reviewedAt = new Date();
    if (status === 'Rejected') {
      experience.rejectionReason = rejectionReason.trim();
    } else {
      experience.rejectionReason = '';
    }

    await experience.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: `EXPERIENCE_${status.toUpperCase()}`,
      targetType: 'InterviewExperience',
      targetId: experience._id,
      changeSummary: `Placement Officer ${status.toLowerCase()} interview experience submitted by ${experience.studentId?.name} for ${experience.companyId?.name}.`,
    });

    res.status(200).json({
      success: true,
      message: `Interview experience successfully marked as "${status}".`,
      experience,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOfficerDashboardStats,
  getStudents,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  getPlacementRecords,
  createPlacementRecord,
  verifyPlacement,
  deletePlacementRecord,
  getModerationQueue,
  moderateExperience,
};
