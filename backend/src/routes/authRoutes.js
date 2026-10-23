const express = require('express');
const router = express.Router();
const {
  registerStudent,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public authentication routes
router.post('/register-student', registerStudent);
router.post('/login', login);

// Private profile routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
