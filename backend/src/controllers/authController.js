const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || 'super_secure_placement_jwt_secret_key_2026_xyz987',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Reserved administrative emails list
const getReservedEmails = () => {
  const directorEmail = (process.env.DIRECTOR_EMAIL || 'dharanishssece@gmail.com').toLowerCase().trim();
  const officerEmail = (process.env.OFFICER_EMAIL || 'dharanishcsc@gmail.com').toLowerCase().trim();
  return [directorEmail, officerEmail];
};

/**
 * @desc    Student-only public registration
 * @route   POST /api/auth/register-student
 * @access  Public
 */
const registerStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, email, password, department, phone, batch, cgpa } = req.body;

    // 1. Basic validation
    if (!name || !rollNumber || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, roll number, email, password, and department.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNumber = rollNumber.toUpperCase().trim();

    // 2. Strict administrative reservation check
    const reservedEmails = getReservedEmails();
    if (reservedEmails.includes(normalizedEmail)) {
      return res.status(403).json({
        success: false,
        message: 'This email cannot be used for student registration.',
      });
    }

    // 3. Reject any attempt to pass an administrative role
    if (req.body.role && (req.body.role === 'placement_director' || req.body.role === 'placement_officer')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Administrative accounts cannot be registered publicly.',
      });
    }

    // 4. Check for existing email or roll number
    const existingByEmail = await User.findOne({ email: normalizedEmail });
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    const existingByRoll = await User.findOne({ rollNumber: normalizedRollNumber });
    if (existingByRoll) {
      return res.status(409).json({
        success: false,
        message: 'A student with this Roll Number is already registered.',
      });
    }

    // 5. Hash password and save new student (Forced role: student)
    const passwordHash = await User.hashPassword(password);

    const newStudent = await User.create({
      name: name.trim(),
      rollNumber: normalizedRollNumber,
      email: normalizedEmail,
      passwordHash,
      department: department.trim(),
      role: 'student', // enforced by backend
      phone: phone ? phone.trim() : '',
      batch: batch ? batch.trim() : '2022-2026',
      cgpa: cgpa ? Number(cgpa) : 0,
      accountStatus: 'active',
    });

    const token = generateToken(newStudent);

    const safeUser = newStudent.toObject();
    delete safeUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login for all three roles
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the placement administration. Contact the placement office.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    // Record last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, cgpa } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (cgpa !== undefined && user.role === 'student') user.cgpa = Number(cgpa);

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change Password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please keep your credentials secure.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  login,
  getMe,
  updateProfile,
  changePassword,
};
