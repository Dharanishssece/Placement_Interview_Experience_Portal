const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/officerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Officer routes require authentication and placement_officer (or placement_director) role
router.use(verifyToken);
router.use(requireRole('placement_officer', 'placement_director'));

router.get('/dashboard-stats', getOfficerDashboardStats);

// Student management
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.put('/students/:id/status', toggleStudentStatus);
router.delete('/students/:id', deleteStudent);

// Placement management
router.get('/placements', getPlacementRecords);
router.post('/placements', createPlacementRecord);
router.put('/placements/:id/verify', verifyPlacement);
router.delete('/placements/:id', deletePlacementRecord);

// Interview Experience Moderation
router.get('/moderation', getModerationQueue);
router.put('/moderation/:id', moderateExperience);

module.exports = router;
