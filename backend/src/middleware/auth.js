const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PlacementRecord = require('../models/PlacementRecord');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secure_placement_jwt_secret_key_2026_xyz987');

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: user not found.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the placement administration.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

// Middleware to restrict access by role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
};

// Middleware to ensure student has a verified placement before submitting experience
const requireVerifiedPlacement = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit interview experiences.',
      });
    }

    const driveId = req.body.driveId || req.params.driveId;
    const companyId = req.body.companyId || req.params.companyId;

    if (!driveId && !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Placement drive or company ID is required to verify eligibility.',
      });
    }

    const query = {
      studentId: req.user._id,
      verificationStatus: 'Verified',
    };

    if (driveId) query.driveId = driveId;
    if (companyId) query.companyId = companyId;

    const record = await PlacementRecord.findOne(query);

    if (!record) {
      return res.status(403).json({
        success: false,
        message: 'Eligibility verification failed: You do not have a verified placement record for this company and drive.',
      });
    }

    req.verifiedPlacementRecord = record;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  requireRole,
  requireVerifiedPlacement,
};
