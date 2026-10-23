const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementRecord = require('../models/PlacementRecord');
const InterviewExperience = require('../models/InterviewExperience');
const Bookmark = require('../models/Bookmark');
const PreparationTracker = require('../models/PreparationTracker');
const AuditLog = require('../models/AuditLog');

async function seedDatabase() {
  console.log('[Seed] Starting database population...');

  try {
    await connectDB();

    // Clear existing collections for a clean, deterministic seed
    await User.deleteMany({});
    await Company.deleteMany({});
    await PlacementDrive.deleteMany({});
    await PlacementRecord.deleteMany({});
    await InterviewExperience.deleteMany({});
    await Bookmark.deleteMany({});
    await PreparationTracker.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seed] Cleared existing database records.');

    // 1. Create Placement Director & Officer with requested credentials
    const directorEmail = (process.env.DIRECTOR_EMAIL || 'dharanishssece@gmail.com').toLowerCase().trim();
    const directorPassword = process.env.DIRECTOR_INITIAL_PASSWORD || 'Dharani@136';
    const directorHash = await User.hashPassword(directorPassword);

    const director = await User.create({
      name: 'Dr. R. K. Sharma (Placement Director)',
      email: directorEmail,
      passwordHash: directorHash,
      role: 'placement_director',
      department: 'Administration',
      phone: '+91 98401 23456',
      accountStatus: 'active',
    });

    const officerEmail = (process.env.OFFICER_EMAIL || 'dharanishcsc@gmail.com').toLowerCase().trim();
    const officerPassword = process.env.OFFICER_INITIAL_PASSWORD || 'Dharani@136';
    const officerHash = await User.hashPassword(officerPassword);

    const officer = await User.create({
      name: 'Prof. S. Dharan (Senior Placement Officer)',
      email: officerEmail,
      passwordHash: officerHash,
      role: 'placement_officer',
      department: 'Placement Cell',
      phone: '+91 98402 34567',
      accountStatus: 'active',
    });

    console.log('[Seed] Created Director & Officer accounts.');

    // 2. Create Sample Students
    const studentPassword = await User.hashPassword('Student@123');

    const students = await User.create([
      {
        name: 'Rahul Sharma',
        rollNumber: '22CS101',
        email: 'student1@college.edu',
        passwordHash: studentPassword,
        department: 'CSE',
        role: 'student',
        phone: '+91 97890 12345',
        batch: '2022-2026',
        cgpa: 8.85,
        accountStatus: 'active',
      },
      {
        name: 'Ananya Iyer',
        rollNumber: '22IT102',
        email: 'student2@college.edu',
        passwordHash: studentPassword,
        department: 'IT',
        role: 'student',
        phone: '+91 97890 23456',
        batch: '2022-2026',
        cgpa: 9.32,
        accountStatus: 'active',
      },
      {
        name: 'Karthik Rajan',
        rollNumber: '22EC103',
        email: 'student3@college.edu',
        passwordHash: studentPassword,
        department: 'ECE',
        role: 'student',
        phone: '+91 97890 34567',
        batch: '2022-2026',
        cgpa: 8.45,
        accountStatus: 'active',
      },
      {
        name: 'Priya Nair',
        rollNumber: '22CS104',
        email: 'student4@college.edu',
        passwordHash: studentPassword,
        department: 'CSE',
        role: 'student',
        phone: '+91 97890 45678',
        batch: '2022-2026',
        cgpa: 8.92,
        accountStatus: 'active',
      },
      {
        name: 'Vignesh Kumar',
        rollNumber: '22EE105',
        email: 'student5@college.edu',
        passwordHash: studentPassword,
        department: 'EEE',
        role: 'student',
        phone: '+91 97890 56789',
        batch: '2022-2026',
        cgpa: 7.75,
        accountStatus: 'active',
      },
      {
        name: 'Sneha Patel',
        rollNumber: '22AI106',
        email: 'student6@college.edu',
        passwordHash: studentPassword,
        department: 'AIDS',
        role: 'student',
        phone: '+91 97890 67890',
        batch: '2022-2026',
        cgpa: 8.65,
        accountStatus: 'active',
      },
      {
        name: 'Arjun Verma',
        rollNumber: '22ME107',
        email: 'student7@college.edu',
        passwordHash: studentPassword,
        department: 'MECH',
        role: 'student',
        phone: '+91 97890 78901',
        batch: '2022-2026',
        cgpa: 7.95,
        accountStatus: 'active',
      },
    ]);

    console.log(`[Seed] Created ${students.length} student accounts.`);

    // 3. Create Companies
    const companies = await Company.create([
      {
        name: 'Google India',
        website: 'https://careers.google.com',
        industry: 'Internet & Cloud Computing',
        description: 'Google LLC is an American multinational corporation and technology company focusing on online advertising, search engine technology, cloud computing, computer software, and artificial intelligence.',
        headquarters: 'Bengaluru, Karnataka',
        tier: 'Tier 1 (Dream)',
        notes: 'Strict DSA, System Design, and Googliness behavioral rounds.',
      },
      {
        name: 'Microsoft IDC',
        website: 'https://careers.microsoft.com',
        industry: 'Software & Cloud Services',
        description: 'Microsoft India Development Center (IDC) is one of Microsoft’s largest R&D centers outside headquarters in Redmond, building core Azure cloud, Teams, and Office experiences.',
        headquarters: 'Hyderabad, Telangana',
        tier: 'Tier 1 (Dream)',
        notes: 'Strong focus on Tree/Graph algorithms, Operating Systems, and OOP design.',
      },
      {
        name: 'Amazon Development Centre',
        website: 'https://www.amazon.jobs',
        industry: 'E-Commerce & Cloud Infrastructure',
        description: 'Amazon AWS and Consumer Teams hire software engineers focusing on distributed systems, DynamoDB, microservices, and 14 Amazon Leadership Principles.',
        headquarters: 'Bengaluru, Karnataka',
        tier: 'Tier 1 (Dream)',
        notes: 'Leadership principles (LP) questions must be framed using the STAR method.',
      },
      {
        name: 'Cisco Systems',
        website: 'https://www.cisco.com/careers',
        industry: 'Networking & Cybersecurity',
        description: 'Cisco Systems is an American multinational digital communications technology conglomerate corporation specializing in networking hardware, software, and telecommunications.',
        headquarters: 'Bengaluru, Karnataka',
        tier: 'Tier 1 (Dream)',
        notes: 'Computer Networks, C/C++, Embedded/System architecture, and DSA.',
      },
      {
        name: 'Zoho Corporation',
        website: 'https://www.zoho.com/careers',
        industry: 'SaaS & Enterprise Business Tools',
        description: 'Zoho Corporation is an Indian multinational technology company that makes computer software and web-based business tools, famous for its in-house programming rounds.',
        headquarters: 'Chennai, Tamil Nadu',
        tier: 'Tier 2 (Core)',
        notes: 'Rigorous programming rounds: Basic C/Java programming, Advanced problem solving, no pre-built libraries allowed.',
      },
      {
        name: 'TCS Digital',
        website: 'https://www.tcs.com/careers',
        industry: 'IT Consulting & Cloud Solutions',
        description: 'Tata Consultancy Services Digital profile offers premium packages for high-scoring candidates in TCS NQT followed by digital-level technical interview rounds.',
        headquarters: 'Mumbai, Maharashtra',
        tier: 'Tier 2 (Core)',
        notes: 'Advanced aptitude, competitive programming, and emerging technology discussion.',
      },
      {
        name: 'Infosys Specialist Programmer',
        website: 'https://www.infosys.com/careers',
        industry: 'IT Services & Digital Transformation',
        description: 'Specialist Programmer (SP) and Digital Specialist Engineer (DSE) roles through InfyTQ and HackWithInfy competitions.',
        headquarters: 'Bengaluru, Karnataka',
        tier: 'Tier 3 (Mass / IT Services)',
        notes: 'Focus on medium-to-hard DP and graph questions.',
      },
    ]);

    console.log(`[Seed] Created ${companies.length} companies.`);

    // 4. Create Placement Drives
    const drives = await PlacementDrive.create([
      {
        companyId: companies[0]._id, // Google
        academicYear: '2025-2026',
        driveDate: new Date('2025-09-15'),
        jobRoles: [
          {
            roleTitle: 'Software Engineer - University Graduate',
            ctc: 32.5,
            ctcDisplay: '32.5 LPA',
            vacancies: 6,
            jobDescription: 'Design, develop, test, deploy, maintain, and enhance large-scale distributed software solutions.',
          },
        ],
        eligibleDepartments: ['CSE', 'IT', 'ECE'],
        minCgpa: 8.0,
        recruitmentStatus: 'Completed',
        selectionRounds: ['Online Assessment (Coding)', 'Technical Interview 1', 'Technical Interview 2', 'Googliness & Leadership'],
      },
      {
        companyId: companies[1]._id, // Microsoft
        academicYear: '2025-2026',
        driveDate: new Date('2025-10-05'),
        jobRoles: [
          {
            roleTitle: 'Software Development Engineer (SDE-1)',
            ctc: 28.0,
            ctcDisplay: '28.0 LPA',
            vacancies: 8,
            jobDescription: 'Build next-generation cloud services across Azure, Microsoft 365, and AI platforms.',
          },
        ],
        eligibleDepartments: ['CSE', 'IT', 'ECE', 'AIDS'],
        minCgpa: 7.5,
        recruitmentStatus: 'Completed',
        selectionRounds: ['Codility Online Test', 'Technical Round 1 (DSA)', 'Technical Round 2 (System & OS)', 'AA Round (Director Interview)'],
      },
      {
        companyId: companies[2]._id, // Amazon
        academicYear: '2025-2026',
        driveDate: new Date('2025-10-25'),
        jobRoles: [
          {
            roleTitle: 'Software Development Engineer - I',
            ctc: 24.5,
            ctcDisplay: '24.5 LPA',
            vacancies: 10,
            jobDescription: 'Work on cutting-edge AWS microservices and global customer fulfillment architectures.',
          },
        ],
        eligibleDepartments: ['CSE', 'IT', 'ECE'],
        minCgpa: 7.5,
        recruitmentStatus: 'Completed',
        selectionRounds: ['OA1 (Debugging & Aptitude)', 'OA2 (Coding)', 'Onsite Tech 1 (DSA + LP)', 'Onsite Tech 2 (System Design + LP)', 'Bar Raiser'],
      },
      {
        companyId: companies[3]._id, // Cisco
        academicYear: '2025-2026',
        driveDate: new Date('2025-11-12'),
        jobRoles: [
          {
            roleTitle: 'Systems & Software Engineer',
            ctc: 18.0,
            ctcDisplay: '18.0 LPA',
            vacancies: 12,
            jobDescription: 'Develop real-time network OS, switching protocols, and security firmware.',
          },
        ],
        eligibleDepartments: ['CSE', 'IT', 'ECE', 'EEE'],
        minCgpa: 7.0,
        recruitmentStatus: 'Completed',
        selectionRounds: ['Aptitude & Technical MCQ', 'Coding Round', 'Technical Interview', 'Managerial & HR'],
      },
      {
        companyId: companies[4]._id, // Zoho
        academicYear: '2025-2026',
        driveDate: new Date('2025-12-02'),
        jobRoles: [
          {
            roleTitle: 'Software Developer',
            ctc: 9.5,
            ctcDisplay: '9.5 LPA',
            vacancies: 25,
            jobDescription: 'Develop web engines, CRM applications, and office productivity tools in Java/C++.',
          },
        ],
        eligibleDepartments: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'AIDS'],
        minCgpa: 6.5,
        recruitmentStatus: 'Completed',
        selectionRounds: ['General Aptitude', 'Basic Programming Round', 'Advanced Programming (App Development)', 'Technical & HR'],
      },
      {
        companyId: companies[5]._id, // TCS Digital
        academicYear: '2025-2026',
        driveDate: new Date('2026-01-18'),
        jobRoles: [
          {
            roleTitle: 'Digital Software Engineer',
            ctc: 7.5,
            ctcDisplay: '7.5 LPA',
            vacancies: 30,
            jobDescription: 'Develop enterprise cloud and AI solutions.',
          },
        ],
        eligibleDepartments: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS'],
        minCgpa: 6.5,
        recruitmentStatus: 'Ongoing',
        selectionRounds: ['TCS NQT Advanced Test', 'Digital Technical Interview', 'HR Round'],
      },
    ]);

    console.log(`[Seed] Created ${drives.length} placement drives.`);

    // 5. Create Placement Records (Student selections and verifications)
    const placements = await PlacementRecord.create([
      {
        studentId: students[0]._id, // Rahul Sharma
        companyId: companies[0]._id, // Google
        driveId: drives[0]._id,
        jobRole: 'Software Engineer - University Graduate',
        packageCTC: 32.5,
        packageDisplay: '32.5 LPA',
        selectionDate: new Date('2025-09-20'),
        offerStatus: 'Accepted',
        verificationStatus: 'Verified',
        verifiedBy: officer._id,
        verifiedAt: new Date('2025-09-22'),
        remarks: 'Cleared all 4 Google interview rounds with exceptional feedback in Algorithms.',
      },
      {
        studentId: students[1]._id, // Ananya Iyer (Multiple offers demonstrated!)
        companyId: companies[1]._id, // Microsoft
        driveId: drives[1]._id,
        jobRole: 'Software Development Engineer (SDE-1)',
        packageCTC: 28.0,
        packageDisplay: '28.0 LPA',
        selectionDate: new Date('2025-10-10'),
        offerStatus: 'Accepted',
        verificationStatus: 'Verified',
        verifiedBy: officer._id,
        verifiedAt: new Date('2025-10-12'),
        remarks: 'Offer verified with official Microsoft IDC offer letter.',
      },
      {
        studentId: students[1]._id, // Ananya Iyer (Second offer: Amazon)
        companyId: companies[2]._id, // Amazon
        driveId: drives[2]._id,
        jobRole: 'Software Development Engineer - I',
        packageCTC: 24.5,
        packageDisplay: '24.5 LPA',
        selectionDate: new Date('2025-10-30'),
        offerStatus: 'Declined',
        verificationStatus: 'Verified',
        verifiedBy: officer._id,
        verifiedAt: new Date('2025-11-01'),
        remarks: 'Candidate opted for Microsoft offer.',
      },
      {
        studentId: students[2]._id, // Karthik Rajan
        companyId: companies[3]._id, // Cisco
        driveId: drives[3]._id,
        jobRole: 'Systems & Software Engineer',
        packageCTC: 18.0,
        packageDisplay: '18.0 LPA',
        selectionDate: new Date('2025-11-18'),
        offerStatus: 'Accepted',
        verificationStatus: 'Verified',
        verifiedBy: officer._id,
        verifiedAt: new Date('2025-11-20'),
        remarks: 'Strong performance in networking socket programming.',
      },
      {
        studentId: students[3]._id, // Priya Nair
        companyId: companies[4]._id, // Zoho
        driveId: drives[4]._id,
        jobRole: 'Software Developer',
        packageCTC: 9.5,
        packageDisplay: '9.5 LPA',
        selectionDate: new Date('2025-12-08'),
        offerStatus: 'Accepted',
        verificationStatus: 'Verified',
        verifiedBy: officer._id,
        verifiedAt: new Date('2025-12-10'),
        remarks: 'Demonstrated top code quality in Advanced Application round.',
      },
      {
        studentId: students[5]._id, // Sneha Patel (Pending verification demo)
        companyId: companies[5]._id, // TCS Digital
        driveId: drives[5]._id,
        jobRole: 'Digital Software Engineer',
        packageCTC: 7.5,
        packageDisplay: '7.5 LPA',
        selectionDate: new Date('2026-01-25'),
        offerStatus: 'Offered',
        verificationStatus: 'Pending', // For officer to verify!
        remarks: 'Offer letter under document validation by Placement Office.',
      },
    ]);

    console.log(`[Seed] Created ${placements.length} placement records.`);

    // 6. Create Realistic Interview Experiences with full round-by-round details
    const samplePdfAttachment = {
      originalName: 'Google_SWE_Interview_Notes.pdf',
      filename: 'sample_interview_experience.pdf',
      filePath: '/uploads/sample_interview_experience.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      uploadedAt: new Date(),
    };

    const exp1 = await InterviewExperience.create({
      studentId: students[0]._id, // Rahul Sharma
      companyId: companies[0]._id, // Google
      driveId: drives[0]._id,
      jobRole: 'Software Engineer - University Graduate',
      selectionYear: '2025',
      difficultyLevel: 'Hard',
      overallExperience: 'The Google recruitment process was intellectually stimulating and exceptionally well organized. The interviewers were very collaborative and guided me whenever I got stuck. They care deeply about your thought process, clean code, handling of boundary conditions, and time/space complexity optimization.',
      preparationStrategy: 'I solved around 350 LeetCode problems (focusing heavily on Medium & Hard Graph, Trees, DP, and Segment Trees). I also practiced timed mock interviews on Pramp and read Google interview debriefs on LeetCode Discuss. Revise time complexities of all STL/Collections data structures.',
      tips: '1. Never start coding immediately. Clarify all input constraints and discuss brute-force vs optimal approaches first.\n2. Write modular functions and dry-run with a small example on the virtual whiteboard.\n3. Be vocal about your thought process.',
      pdfAttachment: samplePdfAttachment,
      status: 'Approved',
      reviewedBy: officer._id,
      reviewedAt: new Date('2025-09-25'),
      helpfulCount: 28,
      viewCount: 142,
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Round 1: Online Coding Assessment',
          roundType: 'Coding',
          duration: '90 mins',
          description: 'Conducted on Google testing platform. Consisted of 2 algorithmic questions.',
          questions: [
            {
              questionText: 'Find the minimum cost path in a weighted directed graph where edges can have dynamic weight adjustments based on visit frequency.',
              answerExplanation: 'Solved using Modified Dijkstra with priority queue and state tracking for edge frequencies. Time complexity: O(E log V).',
              topic: 'Graph Algorithms / Dijkstra',
              difficulty: 'Hard',
            },
            {
              questionText: 'Given an array of server capacities and a stream of tasks, assign tasks to minimize peak variance across clusters.',
              answerExplanation: 'Used Binary Search on the answer with greedy verification function in O(N log(max_capacity)).',
              topic: 'Binary Search / Greedy',
              difficulty: 'Medium',
            },
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Round 2: Technical Interview 1 (DSA)',
          roundType: 'Technical',
          duration: '45 mins',
          description: 'One-on-one virtual interview using Google Docs / Meet.',
          questions: [
            {
              questionText: 'Implement an In-Memory File System with mkdir, addContentToFile, readContentFromFile, and ls commands.',
              answerExplanation: 'Implemented using a Trie-like directory tree structure where each Node contains a map of children nodes and file content strings.',
              topic: 'Trie / Tree Data Structure',
              difficulty: 'Hard',
            },
          ],
        },
        {
          roundNumber: 3,
          roundName: 'Round 3: Technical Interview 2 (Algorithms & Optimization)',
          roundType: 'Technical',
          duration: '45 mins',
          description: 'Deep dive into algorithmic optimization and memory constraints.',
          questions: [
            {
              questionText: 'Serialize and Deserialize a N-ary Tree with arbitrary child nodes.',
              answerExplanation: 'Used level-order traversal with end-of-children markers (sentinel values) to ensure lossless reconstruction.',
              topic: 'Trees / BFS',
              difficulty: 'Medium',
            },
          ],
        },
        {
          roundNumber: 4,
          roundName: 'Round 4: Googliness & Leadership',
          roundType: 'HR',
          duration: '45 mins',
          description: 'Behavioral interview focusing on handling ambiguity, peer conflicts, and ethical engineering decisions.',
          questions: [
            {
              questionText: 'Tell me about a time when you strongly disagreed with a team member on a technical choice. How did you resolve it?',
              answerExplanation: 'Framed using STAR method: Described our college capstone project where we debated PostgreSQL vs MongoDB. Built benchmarks to let metrics decide objectively.',
              topic: 'Conflict Resolution',
              difficulty: 'Medium',
            },
          ],
        },
      ],
    });

    const exp2 = await InterviewExperience.create({
      studentId: students[1]._id, // Ananya Iyer
      companyId: companies[1]._id, // Microsoft
      driveId: drives[1]._id,
      jobRole: 'Software Development Engineer (SDE-1)',
      selectionYear: '2025',
      difficultyLevel: 'Medium',
      overallExperience: 'Microsoft interviewers were extremely polite and focused on core computer science foundations. They placed heavy weight on clean code, unit testing, and Operating Systems concepts like threads, semaphores, and virtual memory.',
      preparationStrategy: 'Practiced 250 LeetCode problems (focusing on Binary Trees, Linked Lists, Matrix, and Recursion/Backtracking). Thoroughly revised Silberschatz Operating Systems and Navathe DBMS concepts.',
      tips: 'Always write tests for your code, including null pointers, empty lists, and extreme numeric boundaries.',
      pdfAttachment: null,
      status: 'Approved',
      reviewedBy: officer._id,
      reviewedAt: new Date('2025-10-15'),
      helpfulCount: 19,
      viewCount: 98,
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Round 1: Codility Online Test',
          roundType: 'Coding',
          duration: '90 mins',
          description: '3 programming challenges with strict performance criteria.',
          questions: [
            {
              questionText: 'Given an array of strings, group anagrams together in O(N * K) time.',
              answerExplanation: 'Used character frequency counts hashed as map keys to achieve optimal linear time.',
              topic: 'Hashing / Strings',
              difficulty: 'Medium',
            },
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Round 2: Technical Interview 1 (DSA & OS)',
          roundType: 'Technical',
          duration: '45 mins',
          description: 'Coding questions followed by questions on processes, threads, and memory hierarchy.',
          questions: [
            {
              questionText: 'Lowest Common Ancestor in a Binary Tree (not a BST) without parent pointers.',
              answerExplanation: 'Solved via post-order DFS in O(N) time and O(H) stack space.',
              topic: 'Binary Trees / Recursion',
              difficulty: 'Medium',
            },
            {
              questionText: 'Explain the difference between a Process and a Thread, and explain how a Deadlock can be detected in OS.',
              answerExplanation: 'Detailed virtual memory address spaces, PCB/TCB overhead, and Banker’s algorithm / Resource Allocation Graph.',
              topic: 'Operating Systems',
              difficulty: 'Medium',
            },
          ],
        },
        {
          roundNumber: 3,
          roundName: 'Round 3: As Appropriate (AA) Director Round',
          roundType: 'Managerial',
          duration: '50 mins',
          description: 'High level system architecture design and culture alignment.',
          questions: [
            {
              questionText: 'Design a simplified URL shortening service like TinyURL.',
              answerExplanation: 'Discussed Base62 encoding, hash collision strategies, read/write ratios, cache invalidation with Redis, and database sharding.',
              topic: 'System Design',
              difficulty: 'Hard',
            },
          ],
        },
      ],
    });

    const exp3 = await InterviewExperience.create({
      studentId: students[3]._id, // Priya Nair
      companyId: companies[4]._id, // Zoho
      driveId: drives[4]._id,
      jobRole: 'Software Developer',
      selectionYear: '2025',
      difficultyLevel: 'Medium',
      overallExperience: 'Zoho is famous for its practical coding focus! They do not rely on standard LeetCode tricks; they test if you can write a complete command-line application from scratch without using Java Collections (ArrayList/HashMap) in the advanced round.',
      preparationStrategy: 'Practiced building terminal games (Tic-Tac-Toe, Snake, Dungeon crawler) and custom array/linked list implementations from scratch in C/Java.',
      tips: 'Master 2D array matrix navigation, recursion, and object-oriented modeling. Keep code modular.',
      pdfAttachment: null,
      status: 'Approved',
      reviewedBy: officer._id,
      reviewedAt: new Date('2025-12-12'),
      helpfulCount: 34,
      viewCount: 165,
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Round 1: General Aptitude & C Output Prediction',
          roundType: 'Aptitude',
          duration: '60 mins',
          description: 'Pointers, pre/post increments, bitwise operators, and quant questions.',
          questions: [
            {
              questionText: 'Predict the output of nested pointer dereferencing with array arithmetic in C.',
              answerExplanation: 'Understanding how array decays to pointer to first element and operator precedence.',
              topic: 'C Pointers / Memory',
              difficulty: 'Medium',
            },
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Round 2: Basic Programming Round',
          roundType: 'Coding',
          duration: '90 mins',
          description: '5 programming questions on loops, patterns, and string parsing.',
          questions: [
            {
              questionText: 'Write a program to print characters based on repetition count: e.g. a1b10 should print a followed by ten b’s.',
              answerExplanation: 'Parsed string with two pointers extracting contiguous digits and printing in inner loop.',
              topic: 'String Manipulation',
              difficulty: 'Easy',
            },
          ],
        },
        {
          roundNumber: 3,
          roundName: 'Round 3: Advanced Application Development',
          roundType: 'Technical',
          duration: '3 hours',
          description: 'Build a working Railway Ticket Reservation System with RAC, Waiting List, and cancellation workflows.',
          questions: [
            {
              questionText: 'Design Railway Reservation System with Berth allocation rules, cancellation charges, and ticket status lookup.',
              answerExplanation: 'Created Passenger, Ticket, and Train classes with status queues (Confirmed: 63, RAC: 18, Waiting: 10).',
              topic: 'Object Oriented Design / Application Coding',
              difficulty: 'Hard',
            },
          ],
        },
      ],
    });

    // 7. Create a PENDING Interview Experience for Officer Moderation demo!
    const pendingExp = await InterviewExperience.create({
      studentId: students[2]._id, // Karthik Rajan
      companyId: companies[3]._id, // Cisco
      driveId: drives[3]._id,
      jobRole: 'Systems & Software Engineer',
      selectionYear: '2025',
      difficultyLevel: 'Medium',
      overallExperience: 'Cisco recruitment was focused on socket programming, C pointer concepts, and networking protocols. The interviewer was friendly and gave hints on multithreading concepts.',
      preparationStrategy: 'Revised Kurose & Ross Computer Networking book, practiced socket programming in C, and studied 150 LeetCode medium questions.',
      tips: 'Be very comfortable with TCP 3-way handshake, OSI layers, and memory leaks in C.',
      pdfAttachment: null,
      status: 'Pending Review', // READY FOR OFFICER MODERATION DEMO!
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Round 1: Technical Aptitude & Coding',
          roundType: 'Coding',
          duration: '60 mins',
          description: 'Online test with 30 MCQs on networking and 2 coding problems.',
          questions: [
            {
              questionText: 'Detect cycle in an undirected graph using Union-Find algorithm.',
              answerExplanation: 'Implemented Disjoint Set Union with path compression and union by rank.',
              topic: 'Graphs / DSU',
              difficulty: 'Medium',
            },
          ],
        },
        {
          roundNumber: 2,
          roundName: 'Round 2: Technical Interview (System & Networks)',
          roundType: 'Technical',
          duration: '45 mins',
          description: 'Questions on TCP vs UDP, socket lifecycle, and memory management.',
          questions: [
            {
              questionText: 'Explain what happens under the hood when you type https://google.com in a web browser.',
              answerExplanation: 'Explained DNS resolution, ARP, TCP handshake, TLS/SSL certificate negotiation, HTTP GET request, and server response rendering.',
              topic: 'Computer Networks',
              difficulty: 'Medium',
            },
          ],
        },
      ],
    });

    console.log('[Seed] Created interview experiences (including pending moderation item).');

    // 8. Create Bookmarks for students
    await Bookmark.create([
      { studentId: students[4]._id, experienceId: exp1._id }, // Vignesh bookmarked Google
      { studentId: students[4]._id, experienceId: exp2._id }, // Vignesh bookmarked Microsoft
      { studentId: students[0]._id, experienceId: exp2._id }, // Rahul bookmarked Microsoft
    ]);

    // 9. Create Preparation Trackers for students
    await PreparationTracker.create([
      {
        studentId: students[4]._id, // Vignesh Kumar (unplaced, prepping for Google & Microsoft)
        companyId: companies[0]._id, // Google
        targetRole: 'Software Development Engineer',
        targetDate: new Date('2026-04-30'),
        notes: 'Targeting Google campus off-campus drive in April 2026.',
        tasks: [
          { title: 'Solve Top 50 LeetCode Medium DSA Problems', category: 'DSA & Coding', completed: true, completedAt: new Date() },
          { title: 'Revise DBMS (SQL, Normalization, ACID, Indexing)', category: 'Core Subjects (OS/DBMS/CN)', completed: true, completedAt: new Date() },
          { title: 'Revise Operating Systems (Process, Threads, Memory, Paging)', category: 'Core Subjects (OS/DBMS/CN)', completed: false },
          { title: 'Computer Networks (OSI, TCP/IP, DNS, HTTP/HTTPS)', category: 'Core Subjects (OS/DBMS/CN)', completed: false },
          { title: 'Review System Design Fundamentals & OOPs Concepts', category: 'System Design', completed: false },
          { title: 'Read all interview experiences for Google India', category: 'Company Questions', completed: true, completedAt: new Date() },
          { title: 'Practice Quantitative & Logical Aptitude Mock Tests', category: 'Aptitude', completed: false },
          { title: 'Prepare STAR method answers for HR & Behavioral Round', category: 'HR & Behavioral', completed: false },
          { title: 'Review Resume projects and prepare architecture walkthroughs', category: 'Resume & Projects', completed: false },
        ],
      },
    ]);

    // 10. Create Audit Logs
    await AuditLog.create([
      {
        actorId: director._id,
        actorName: director.name,
        actorRole: director.role,
        action: 'SYSTEM_INITIALIZATION',
        targetType: 'User',
        targetId: director._id,
        changeSummary: 'Placement Director configured academic year 2025-2026 recruitment drives and companies.',
      },
      {
        actorId: officer._id,
        actorName: officer.name,
        actorRole: officer.role,
        action: 'EXPERIENCE_APPROVED',
        targetType: 'InterviewExperience',
        targetId: exp1._id,
        changeSummary: 'Placement Officer reviewed and published Google interview experience submitted by Rahul Sharma.',
      },
    ]);

    console.log('[Seed] Database successfully populated with realistic data!');
    console.log('------------------------------------------------------------');
    console.log('ADMINISTRATIVE CREDENTIALS:');
    console.log(`Director:  Email: ${directorEmail} | Password: ${directorPassword}`);
    console.log(`Officer:   Email: ${officerEmail}  | Password: ${officerPassword}`);
    console.log('STUDENT CREDENTIALS (All password: Student@123):');
    console.log('Placed (Google):     student1@college.edu (Rahul Sharma)');
    console.log('Placed (MS & AWS):   student2@college.edu (Ananya Iyer)');
    console.log('Placed (Cisco):      student3@college.edu (Karthik Rajan)');
    console.log('Placed (Zoho):       student4@college.edu (Priya Nair)');
    console.log('Unplaced (Prepping): student5@college.edu (Vignesh Kumar)');
    console.log('------------------------------------------------------------');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error] Failed to populate database:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
