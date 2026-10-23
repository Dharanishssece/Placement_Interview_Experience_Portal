const express = require('express');
const router = express.Router();
const {
  getStudentDashboardOverview,
  getSubmissionEligibility,
  getPublishedExperiences,
  getExperienceById,
  submitExperience,
  editMyExperience,
  getMySubmissions,
  toggleBookmark,
  getMyBookmarks,
  getPrepTrackers,
  createPrepTracker,
  toggleTrackerTask,
  voteHelpful,
} = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Optional auth helper so public/students can view experiences with isBookmarked flag
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

// Public/Semi-private experience browsing
router.get('/experiences', optionalAuth, getPublishedExperiences);
router.get('/experiences/:id', optionalAuth, getExperienceById);
router.post('/experiences/:id/helpful', verifyToken, voteHelpful);

// Protected Student Portal Routes
router.use(verifyToken);
router.use(requireRole('student'));

router.get('/dashboard-overview', getStudentDashboardOverview);
router.get('/eligibility', getSubmissionEligibility);
router.post('/experiences', upload.single('pdfFile'), submitExperience);
router.put('/experiences/:id', upload.single('pdfFile'), editMyExperience);
router.get('/my-submissions', getMySubmissions);

// Bookmarks
router.get('/bookmarks', getMyBookmarks);
router.post('/bookmarks/:experienceId', toggleBookmark);

// Preparation Tracker
router.get('/prep-trackers', getPrepTrackers);
router.post('/prep-trackers', createPrepTracker);
router.put('/prep-trackers/:trackerId/tasks/:taskId', toggleTrackerTask);

module.exports = router;
