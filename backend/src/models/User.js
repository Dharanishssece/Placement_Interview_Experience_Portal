const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // allows null/undefined for admins while enforcing uniqueness for students
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: [
        'CSE',
        'IT',
        'ECE',
        'EEE',
        'MECH',
        'CIVIL',
        'AIDS',
        'AIML',
        'Placement Cell',
        'Administration',
      ],
      default: 'CSE',
    },
    role: {
      type: String,
      enum: ['placement_director', 'placement_officer', 'student'],
      default: 'student',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    batch: {
      type: String,
      trim: true,
      default: '2022-2026',
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
