const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/directorController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All director routes require authentication and placement_director role
router.use(verifyToken);
router.use(requireRole('placement_director'));

router.get('/dashboard-stats', getDashboardStats);

// Company management
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

// Placement drives
router.get('/drives', getDrives);
router.post('/drives', createDrive);
router.put('/drives/:id', updateDrive);

// Analytics & Reports
router.get('/analytics', getPlacementAnalytics);
router.get('/reports', getPlacementReport);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
