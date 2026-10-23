const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

async function initializeAdmins() {
  console.log('--- ADMINISTRATIVE ACCOUNT INITIALIZATION ---');

  const directorEmail = (process.env.DIRECTOR_EMAIL || 'dharanishssece@gmail.com').toLowerCase().trim();
  const directorPassword = process.env.DIRECTOR_INITIAL_PASSWORD || 'Dharani@136';
  const directorName = process.env.DIRECTOR_NAME || 'Dr. R. K. Sharma (Placement Director)';

  const officerEmail = (process.env.OFFICER_EMAIL || 'dharanishcsc@gmail.com').toLowerCase().trim();
  const officerPassword = process.env.OFFICER_INITIAL_PASSWORD || 'Dharani@136';
  const officerName = process.env.OFFICER_NAME || 'Prof. S. Dharan (Senior Placement Officer)';

  if (!directorEmail || !directorPassword || !officerEmail || !officerPassword) {
    console.error('ERROR: Missing required administrative environment variables in .env');
    process.exit(1);
  }

  try {
    await connectDB();

    // 1. Initialize Placement Director
    const existingDirector = await User.findOne({ email: directorEmail });
    if (!existingDirector) {
      const passwordHash = await User.hashPassword(directorPassword);
      await User.create({
        name: directorName,
        email: directorEmail,
        passwordHash,
        role: 'placement_director',
        department: 'Administration',
        accountStatus: 'active',
      });
      console.log(`[+] Placement Director account initialized: ${directorEmail}`);
    } else {
      if (existingDirector.role !== 'placement_director') {
        console.error(`[!] Conflict: An account with email ${directorEmail} exists with role "${existingDirector.role}"!`);
      } else {
        console.log(`[*] Placement Director account already exists (${directorEmail}). Preserving existing credentials.`);
      }
    }

    // 2. Initialize Placement Officer
    const existingOfficer = await User.findOne({ email: officerEmail });
    if (!existingOfficer) {
      const passwordHash = await User.hashPassword(officerPassword);
      await User.create({
        name: officerName,
        email: officerEmail,
        passwordHash,
        role: 'placement_officer',
        department: 'Placement Cell',
        accountStatus: 'active',
      });
      console.log(`[+] Placement Officer account initialized: ${officerEmail}`);
    } else {
      if (existingOfficer.role !== 'placement_officer') {
        console.error(`[!] Conflict: An account with email ${officerEmail} exists with role "${existingOfficer.role}"!`);
      } else {
        console.log(`[*] Placement Officer account already exists (${officerEmail}). Preserving existing credentials.`);
      }
    }

    console.log('--- ADMINISTRATIVE INITIALIZATION COMPLETED ---');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during administrative initialization:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  initializeAdmins();
}

module.exports = initializeAdmins;
