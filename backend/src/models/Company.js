const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      default: 'Information Technology & Services',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    headquarters: {
      type: String,
      trim: true,
      default: 'Bengaluru, India',
    },
    tier: {
      type: String,
      enum: ['Tier 1 (Dream)', 'Tier 2 (Core)', 'Tier 3 (Mass / IT Services)', 'Startup'],
      default: 'Tier 1 (Dream)',
    },
    notes: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
