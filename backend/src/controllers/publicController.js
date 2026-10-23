const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementRecord = require('../models/PlacementRecord');
const InterviewExperience = require('../models/InterviewExperience');
const User = require('../models/User');

/**
 * @desc    Get landing page public placement highlights and stats
 * @route   GET /api/public/stats
 * @access  Public
 */
const getPublicStats = async (req, res, next) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalDrives = await PlacementDrive.countDocuments();
    const totalOffers = await PlacementRecord.countDocuments({ verificationStatus: 'Verified' });
    const uniquePlaced = (await PlacementRecord.distinct('studentId', { verificationStatus: 'Verified' })).length;
    const totalExperiences = await InterviewExperience.countDocuments({ status: 'Approved' });

    // Top package CTC
    const ctcAgg = await PlacementRecord.aggregate([
      { $match: { verificationStatus: 'Verified' } },
      { $group: { _id: null, maxCTC: { $max: '$packageCTC' }, avgCTC: { $avg: '$packageCTC' } } },
    ]);

    const highestCTC = ctcAgg[0]?.maxCTC || 0;
    const avgCTC = ctcAgg[0]?.avgCTC ? Number(ctcAgg[0].avgCTC.toFixed(1)) : 0;

    // Featured top companies
    const topCompanies = await Company.find().sort({ createdAt: -1 }).limit(8).select('name industry logoUrl tier headquarters');

    // Recent approved experiences
    const featuredExperiences = await InterviewExperience.find({ status: 'Approved' })
      .populate('companyId', 'name logoUrl industry tier')
      .populate('studentId', 'name department')
      .sort({ createdAt: -1 })
      .limit(6)
      .select('jobRole selectionYear difficultyLevel overallExperience helpfulCount createdAt rounds');

    res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        totalDrives,
        totalOffers,
        uniquePlaced,
        totalExperiences,
        highestCTC,
        avgCTC,
      },
      topCompanies,
      featuredExperiences,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
};
