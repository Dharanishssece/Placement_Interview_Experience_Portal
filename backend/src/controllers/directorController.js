const mongoose = require('mongoose');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementRecord = require('../models/PlacementRecord');
const InterviewExperience = require('../models/InterviewExperience');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get Placement Director Dashboard Statistics
 * @route   GET /api/director/dashboard-stats
 * @access  Private (placement_director)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total companies
    const totalCompanies = await Company.countDocuments();

    // 2. Total placement drives
    const totalDrives = await PlacementDrive.countDocuments();

    // 3. Total registered students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // 4. Total offers received (Verified)
    const totalOffers = await PlacementRecord.countDocuments({ verificationStatus: 'Verified' });

    // 5. Total unique students placed (Verified)
    const uniquePlacedStudents = await PlacementRecord.distinct('studentId', {
      verificationStatus: 'Verified',
    });
    const totalUniquePlaced = uniquePlacedStudents.length;

    // 6. Participating departments
    const participatingDepartments = await User.distinct('department', { role: 'student' });

    // 7. Pending placement verifications
    const pendingVerifications = await PlacementRecord.countDocuments({ verificationStatus: 'Pending' });

    // 8. Pending interview experiences awaiting review
    const pendingExperiences = await InterviewExperience.countDocuments({ status: 'Pending Review' });

    // 9. Placement percentage
    const placementPercentage = totalStudents > 0 ? ((totalUniquePlaced / totalStudents) * 100).toFixed(1) : 0;

    // 10. Highest and Average CTC (Verified offers)
    const ctcStats = await PlacementRecord.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      {
        $group: {
          _id: null,
          highestCTC: { $max: '$packageCTC' },
          avgCTC: { $avg: '$packageCTC' },
        },
      },
    ]);

    const highestCTC = ctcStats[0]?.highestCTC || 0;
    const avgCTC = ctcStats[0]?.avgCTC ? Number(ctcStats[0].avgCTC.toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        totalDrives,
        totalStudents,
        totalOffers,
        totalUniquePlaced,
        placementPercentage,
        highestCTC,
        avgCTC,
        totalDepartments: participatingDepartments.length,
        pendingVerifications,
        pendingExperiences,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies with search, filter, pagination
 * @route   GET /api/director/companies
 * @access  Private (placement_director, placement_officer, student)
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, tier, page = 1, limit = 12, sort = 'createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (industry && industry !== 'All') {
      query.industry = industry;
    }
    if (tier && tier !== 'All') {
      query.tier = tier;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    if (sort === 'name') sortOption.name = 1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query).sort(sortOption).skip(skip).limit(limitNum).lean();

    // Attach drive count and placed student count for each company
    const enhancedCompanies = await Promise.all(
      companies.map(async (company) => {
        const driveCount = await PlacementDrive.countDocuments({ companyId: company._id });
        const placedCount = await PlacementRecord.countDocuments({
          companyId: company._id,
          verificationStatus: 'Verified',
        });
        const approvedExperiencesCount = await InterviewExperience.countDocuments({
          companyId: company._id,
          status: 'Approved',
        });
        return {
          ...company,
          driveCount,
          placedCount,
          approvedExperiencesCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      companies: enhancedCompanies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company profile with drives and placed students
 * @route   GET /api/director/companies/:id
 * @access  Private (All authenticated)
 */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const drives = await PlacementDrive.find({ companyId: company._id }).sort({ driveDate: -1 });

    const placedRecords = await PlacementRecord.find({
      companyId: company._id,
      verificationStatus: 'Verified',
    })
      .populate('studentId', 'name rollNumber department email phone batch')
      .populate('driveId', 'academicYear')
      .sort({ selectionDate: -1 });

    const experiences = await InterviewExperience.find({
      companyId: company._id,
      status: 'Approved',
    })
      .populate('studentId', 'name rollNumber department')
      .select('jobRole selectionYear difficultyLevel overallExperience tips helpfulCount rounds pdfAttachment createdAt');

    res.status(200).json({
      success: true,
      company,
      drives,
      placedRecords,
      experiences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new company
 * @route   POST /api/director/companies
 * @access  Private (placement_director)
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, website, industry, description, headquarters, tier, notes, logoUrl } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Company name and description are required.',
      });
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A company with the name "${name.trim()}" already exists.`,
      });
    }

    const company = await Company.create({
      name: name.trim(),
      website: website ? website.trim() : '',
      industry: industry ? industry.trim() : 'Information Technology & Services',
      description: description.trim(),
      headquarters: headquarters ? headquarters.trim() : 'Bengaluru, India',
      tier: tier || 'Tier 1 (Dream)',
      notes: notes || '',
      logoUrl: logoUrl || '',
    });

    // Create Audit Log
    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'COMPANY_CREATED',
      targetType: 'Company',
      targetId: company._id,
      changeSummary: `Placement Director added new company: "${company.name}".`,
    });

    res.status(201).json({
      success: true,
      message: 'Company added successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company
 * @route   PUT /api/director/companies/:id
 * @access  Private (placement_director)
 */
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const { name, website, industry, description, headquarters, tier, notes, logoUrl } = req.body;

    if (name && name.trim() !== company.name) {
      const existing = await Company.findOne({ name: name.trim() });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `A company with the name "${name.trim()}" already exists.`,
        });
      }
      company.name = name.trim();
    }

    if (website !== undefined) company.website = website.trim();
    if (industry) company.industry = industry.trim();
    if (description) company.description = description.trim();
    if (headquarters !== undefined) company.headquarters = headquarters.trim();
    if (tier) company.tier = tier;
    if (notes !== undefined) company.notes = notes;
    if (logoUrl !== undefined) company.logoUrl = logoUrl;

    await company.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'COMPANY_UPDATED',
      targetType: 'Company',
      targetId: company._id,
      changeSummary: `Placement Director updated company details for: "${company.name}".`,
    });

    res.status(200).json({
      success: true,
      message: 'Company details updated successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company (with safety check)
 * @route   DELETE /api/director/companies/:id
 * @access  Private (placement_director)
 */
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Check if placement records or drives exist
    const placementCount = await PlacementRecord.countDocuments({ companyId: company._id });
    if (placementCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete company "${company.name}": ${placementCount} student placement record(s) are linked to it. Archive or remove records first.`,
      });
    }

    await PlacementDrive.deleteMany({ companyId: company._id });
    await Company.findByIdAndDelete(company._id);

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'COMPANY_DELETED',
      targetType: 'Company',
      targetId: company._id,
      changeSummary: `Placement Director deleted company: "${company.name}".`,
    });

    res.status(200).json({
      success: true,
      message: 'Company and associated empty drives deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all placement drives
 * @route   GET /api/director/drives
 * @access  Private
 */
const getDrives = async (req, res, next) => {
  try {
    const { companyId, academicYear, status } = req.query;
    const query = {};

    if (companyId) query.companyId = companyId;
    if (academicYear) query.academicYear = academicYear;
    if (status && status !== 'All') query.recruitmentStatus = status;

    const drives = await PlacementDrive.find(query)
      .populate('companyId', 'name industry website tier')
      .sort({ driveDate: -1 })
      .lean();

    // Attach placed count for each drive
    const enhancedDrives = await Promise.all(
      drives.map(async (drive) => {
        const placedCount = await PlacementRecord.countDocuments({
          driveId: drive._id,
          verificationStatus: 'Verified',
        });
        return {
          ...drive,
          placedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      drives: enhancedDrives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new placement drive
 * @route   POST /api/director/drives
 * @access  Private (placement_director)
 */
const createDrive = async (req, res, next) => {
  try {
    const { companyId, academicYear, driveDate, jobRoles, eligibleDepartments, minCgpa, recruitmentStatus, selectionRounds, notes } = req.body;

    if (!companyId || !academicYear || !driveDate) {
      return res.status(400).json({
        success: false,
        message: 'Company, academic year, and drive date are required.',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Referenced company not found.' });
    }

    const drive = await PlacementDrive.create({
      companyId,
      academicYear: academicYear.trim(),
      driveDate: new Date(driveDate),
      jobRoles: Array.isArray(jobRoles) ? jobRoles : [],
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : ['CSE', 'IT', 'ECE'],
      minCgpa: minCgpa ? Number(minCgpa) : 6.5,
      recruitmentStatus: recruitmentStatus || 'Scheduled',
      selectionRounds: Array.isArray(selectionRounds) ? selectionRounds : ['Online Aptitude & Coding', 'Technical Interview', 'HR Round'],
      notes: notes || '',
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DRIVE_CREATED',
      targetType: 'PlacementDrive',
      targetId: drive._id,
      changeSummary: `Created placement drive for ${company.name} (${academicYear}).`,
    });

    res.status(201).json({
      success: true,
      message: 'Placement drive scheduled successfully.',
      drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update placement drive
 * @route   PUT /api/director/drives/:id
 * @access  Private (placement_director)
 */
const updateDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    const { academicYear, driveDate, jobRoles, eligibleDepartments, minCgpa, recruitmentStatus, selectionRounds, notes } = req.body;

    if (academicYear) drive.academicYear = academicYear.trim();
    if (driveDate) drive.driveDate = new Date(driveDate);
    if (jobRoles) drive.jobRoles = jobRoles;
    if (eligibleDepartments) drive.eligibleDepartments = eligibleDepartments;
    if (minCgpa !== undefined) drive.minCgpa = Number(minCgpa);
    if (recruitmentStatus) drive.recruitmentStatus = recruitmentStatus;
    if (selectionRounds) drive.selectionRounds = selectionRounds;
    if (notes !== undefined) drive.notes = notes;

    await drive.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DRIVE_UPDATED',
      targetType: 'PlacementDrive',
      targetId: drive._id,
      changeSummary: `Updated placement drive ${drive._id} status to ${drive.recruitmentStatus}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      drive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed placement analytics for charts
 * @route   GET /api/director/analytics
 * @access  Private (placement_director, placement_officer)
 */
const getPlacementAnalytics = async (req, res, next) => {
  try {
    // 1. Department-wise placement stats
    const deptStats = await PlacementRecord.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.department',
          totalOffers: { $sum: 1 },
          uniquePlaced: { $addToSet: '$student._id' },
          avgCTC: { $avg: '$packageCTC' },
          highestCTC: { $max: '$packageCTC' },
        },
      },
      {
        $project: {
          department: '$_id',
          totalOffers: 1,
          uniquePlaced: { $size: '$uniquePlaced' },
          avgCTC: { $round: ['$avgCTC', 2] },
          highestCTC: 1,
        },
      },
      { $sort: { totalOffers: -1 } },
    ]);

    // 2. Company-wise selections (Top 10)
    const companyStats = await PlacementRecord.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company.name',
          placedCount: { $sum: 1 },
          avgCTC: { $avg: '$packageCTC' },
        },
      },
      {
        $project: {
          companyName: '$_id',
          placedCount: 1,
          avgCTC: { $round: ['$avgCTC', 2] },
        },
      },
      { $sort: { placedCount: -1 } },
      { $limit: 10 },
    ]);

    // 3. Package Range Distribution
    const packageDistribution = await PlacementRecord.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      {
        $bucket: {
          groupBy: '$packageCTC',
          boundaries: [0, 5, 8, 12, 18, 50],
          default: 'Above 50 LPA',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    const formattedPackageDist = [
      { range: '< 5 LPA', count: 0 },
      { range: '5 - 8 LPA', count: 0 },
      { range: '8 - 12 LPA', count: 0 },
      { range: '12 - 18 LPA', count: 0 },
      { range: '18+ LPA (Super Dream)', count: 0 },
    ];

    packageDistribution.forEach((b) => {
      if (b._id === 0) formattedPackageDist[0].count = b.count;
      else if (b._id === 5) formattedPackageDist[1].count = b.count;
      else if (b._id === 8) formattedPackageDist[2].count = b.count;
      else if (b._id === 12) formattedPackageDist[3].count = b.count;
      else if (b._id === 18 || b._id === 'Above 50 LPA') formattedPackageDist[4].count += b.count;
    });

    // 4. Drive Status breakdown
    const driveStatusStats = await PlacementDrive.aggregate([
      {
        $group: {
          _id: '$recruitmentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Monthly Placement Trend (last 12 months)
    const monthlyTrend = await PlacementRecord.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      {
        $group: {
          _id: {
            year: { $year: '$selectionDate' },
            month: { $month: '$selectionDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrend = monthlyTrend.map((t) => ({
      period: `${months[t._id.month - 1]} ${t._id.year}`,
      offers: t.count,
    }));

    res.status(200).json({
      success: true,
      deptStats,
      companyStats,
      packageDistribution: formattedPackageDist,
      driveStatusStats,
      monthlyTrend: formattedTrend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export printable placement report & CSV summary
 * @route   GET /api/director/reports
 * @access  Private (placement_director, placement_officer)
 */
const getPlacementReport = async (req, res, next) => {
  try {
    const { academicYear, department } = req.query;

    const query = { verificationStatus: 'Verified' };

    const records = await PlacementRecord.find(query)
      .populate('studentId', 'name rollNumber department email batch phone')
      .populate('companyId', 'name industry tier')
      .populate('driveId', 'academicYear driveDate')
      .populate('verifiedBy', 'name email')
      .sort({ selectionDate: -1 });

    const filteredRecords = records.filter((r) => {
      let match = true;
      if (department && department !== 'All' && r.studentId?.department !== department) match = false;
      if (academicYear && academicYear !== 'All' && r.driveId?.academicYear !== academicYear) match = false;
      return match;
    });

    res.status(200).json({
      success: true,
      count: filteredRecords.length,
      records: filteredRecords,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get administrative audit logs
 * @route   GET /api/director/audit-logs
 * @access  Private (placement_director)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getDrives,
  createDrive,
  updateDrive,
  getPlacementAnalytics,
  getPlacementReport,
  getAuditLogs,
};
