const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementRecord = require('../models/PlacementRecord');
const InterviewExperience = require('../models/InterviewExperience');
const Bookmark = require('../models/Bookmark');
const PreparationTracker = require('../models/PreparationTracker');

/**
 * @desc    Get Student Dashboard data
 * @route   GET /api/student/dashboard-overview
 * @access  Private (student)
 */
const getStudentDashboardOverview = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // 1. Available companies & experiences count
    const totalCompanies = await Company.countDocuments();
    const totalPublishedExperiences = await InterviewExperience.countDocuments({ status: 'Approved' });

    // 2. Student's own placement records
    const myPlacements = await PlacementRecord.find({ studentId })
      .populate('companyId', 'name logoUrl industry')
      .populate('driveId', 'academicYear driveDate')
      .sort({ selectionDate: -1 });

    const verifiedPlacements = myPlacements.filter((p) => p.verificationStatus === 'Verified');
    const pendingPlacements = myPlacements.filter((p) => p.verificationStatus === 'Pending');

    // 3. Recently published experiences
    const recentExperiences = await InterviewExperience.find({ status: 'Approved' })
      .populate('studentId', 'name department')
      .populate('companyId', 'name logoUrl industry')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Bookmarked experiences
    const bookmarks = await Bookmark.find({ studentId })
      .populate({
        path: 'experienceId',
        match: { status: 'Approved' },
        populate: [
          { path: 'companyId', select: 'name logoUrl industry' },
          { path: 'studentId', select: 'name department' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(6);

    const validBookmarks = bookmarks.filter((b) => b.experienceId !== null);

    // 5. Preparation trackers
    const prepTrackers = await PreparationTracker.find({ studentId })
      .populate('companyId', 'name logoUrl industry')
      .sort({ updatedAt: -1 });

    // 6. Student's own submissions
    const mySubmissions = await InterviewExperience.find({ studentId })
      .populate('companyId', 'name logoUrl')
      .populate('driveId', 'academicYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalCompanies,
        totalPublishedExperiences,
        myPlacements,
        verifiedPlacementsCount: verifiedPlacements.length,
        pendingPlacementsCount: pendingPlacements.length,
        recentExperiences,
        bookmarks: validBookmarks,
        prepTrackers,
        mySubmissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student verified eligibility for experience submission
 * @route   GET /api/student/eligibility
 * @access  Private (student)
 */
const getSubmissionEligibility = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Find all verified placement records for this student
    const verifiedPlacements = await PlacementRecord.find({
      studentId,
      verificationStatus: 'Verified',
    })
      .populate('companyId', 'name industry logoUrl')
      .populate('driveId', 'academicYear jobRoles');

    // Check existing submissions
    const existingSubmissions = await InterviewExperience.find({ studentId }).select('driveId companyId status rejectionReason');

    const eligibilityList = verifiedPlacements.map((record) => {
      const existingSub = existingSubmissions.find(
        (sub) => sub.driveId?.toString() === record.driveId?._id?.toString()
      );

      return {
        recordId: record._id,
        company: record.companyId,
        drive: record.driveId,
        jobRole: record.jobRole,
        packageCTC: record.packageCTC,
        packageDisplay: record.packageDisplay,
        alreadySubmitted: !!existingSub,
        submissionStatus: existingSub ? existingSub.status : null,
        submissionId: existingSub ? existingSub._id : null,
        rejectionReason: existingSub ? existingSub.rejectionReason : null,
      };
    });

    res.status(200).json({
      success: true,
      eligibleCompanies: eligibilityList,
      hasEligiblePlacements: eligibilityList.length > 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get published interview experiences with search, filters, sorting
 * @route   GET /api/student/experiences
 * @access  Public / Private (all users can view approved)
 */
const getPublishedExperiences = async (req, res, next) => {
  try {
    const { companyId, department, role, year, difficulty, roundType, search, sort = 'newest', page = 1, limit = 10 } = req.query;

    const query = { status: 'Approved' };

    if (companyId) query.companyId = companyId;
    if (year && year !== 'All') query.selectionYear = year;
    if (difficulty && difficulty !== 'All') query.difficultyLevel = difficulty;

    if (role) {
      query.jobRole = { $regex: role, $options: 'i' };
    }

    if (roundType && roundType !== 'All') {
      query['rounds.roundType'] = roundType;
    }

    if (search) {
      query.$or = [
        { jobRole: { $regex: search, $options: 'i' } },
        { overallExperience: { $regex: search, $options: 'i' } },
        { preparationStrategy: { $regex: search, $options: 'i' } },
        { 'rounds.questions.questionText': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'helpful') sortOption.helpfulCount = -1;
    else if (sort === 'views') sortOption.viewCount = -1;
    else sortOption.createdAt = -1;

    let experiences = await InterviewExperience.find(query)
      .populate('studentId', 'name rollNumber department')
      .populate('companyId', 'name industry website logoUrl tier')
      .populate('driveId', 'academicYear')
      .sort(sortOption)
      .lean();

    // Department filter on student author
    if (department && department !== 'All') {
      experiences = experiences.filter((e) => e.studentId?.department === department);
    }

    const total = experiences.length;
    const paginated = experiences.slice(skip, skip + limitNum);

    // If student is logged in, attach isBookmarked boolean
    if (req.user && req.user.role === 'student') {
      const userBookmarks = await Bookmark.find({ studentId: req.user._id }).select('experienceId');
      const bookmarkedIds = new Set(userBookmarks.map((b) => b.experienceId.toString()));
      paginated.forEach((exp) => {
        exp.isBookmarked = bookmarkedIds.has(exp._id.toString());
      });
    }

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      experiences: paginated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single interview experience by ID
 * @route   GET /api/student/experiences/:id
 * @access  Private / Public
 */
const getExperienceById = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id)
      .populate('studentId', 'name rollNumber department batch')
      .populate('companyId', 'name industry website logoUrl tier headquarters')
      .populate('driveId', 'academicYear driveDate recruitmentStatus');

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Interview experience not found.' });
    }

    // Only allow unapproved experience to be viewed by author or officer/director
    if (experience.status !== 'Approved') {
      const isAuthor = req.user && req.user._id.toString() === experience.studentId?._id?.toString();
      const isAdmin = req.user && (req.user.role === 'placement_director' || req.user.role === 'placement_officer');
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This interview experience is under review and is not publicly visible.',
        });
      }
    }

    // Increment view count atomically
    await InterviewExperience.findByIdAndUpdate(experience._id, { $inc: { viewCount: 1 } });

    // Check bookmark
    let isBookmarked = false;
    if (req.user && req.user.role === 'student') {
      const bm = await Bookmark.findOne({ studentId: req.user._id, experienceId: experience._id });
      isBookmarked = !!bm;
    }

    const expObj = experience.toObject();
    expObj.isBookmarked = isBookmarked;

    res.status(200).json({
      success: true,
      experience: expObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit new interview experience (Verified placement required)
 * @route   POST /api/student/experiences
 * @access  Private (student with verified placement)
 */
const submitExperience = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { companyId, driveId, jobRole, selectionYear, difficultyLevel, overallExperience, preparationStrategy, tips, rounds } = req.body;

    if (!companyId || !driveId || !jobRole || !overallExperience || !preparationStrategy) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company, placement drive, job role, overall experience, and preparation strategy.',
      });
    }

    // SERVER-SIDE ELIGIBILITY CHECK: Check PlacementRecord
    const placement = await PlacementRecord.findOne({
      studentId,
      companyId,
      driveId,
      verificationStatus: 'Verified',
    });

    if (!placement) {
      return res.status(403).json({
        success: false,
        message: 'Submission denied: You do not have a verified placement record for this company and drive.',
      });
    }

    // Check if already submitted
    const existing = await InterviewExperience.findOne({ studentId, driveId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an interview experience for this placement drive. You can edit your existing submission.',
      });
    }

    // Parse rounds if passed as JSON string (from multipart form data)
    let parsedRounds = [];
    if (rounds) {
      try {
        parsedRounds = typeof rounds === 'string' ? JSON.parse(rounds) : rounds;
      } catch (e) {
        parsedRounds = [];
      }
    }

    // Handle optional PDF attachment
    let pdfAttachment = null;
    if (req.file) {
      pdfAttachment = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
      };
    }

    const experience = await InterviewExperience.create({
      studentId,
      companyId,
      driveId,
      jobRole: jobRole.trim(),
      selectionYear: selectionYear ? selectionYear.trim() : new Date().getFullYear().toString(),
      difficultyLevel: difficultyLevel || 'Medium',
      overallExperience: overallExperience.trim(),
      preparationStrategy: preparationStrategy.trim(),
      tips: tips ? tips.trim() : '',
      rounds: parsedRounds,
      pdfAttachment,
      status: 'Pending Review',
    });

    res.status(201).json({
      success: true,
      message: 'Interview experience submitted successfully! It is now pending review by the Placement Officer.',
      experience,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit rejected or pending submission
 * @route   PUT /api/student/experiences/:id
 * @access  Private (student author only)
 */
const editMyExperience = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }

    // Authorization check: Only author can edit
    if (experience.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own submissions.',
      });
    }

    const { jobRole, selectionYear, difficultyLevel, overallExperience, preparationStrategy, tips, rounds } = req.body;

    if (jobRole) experience.jobRole = jobRole.trim();
    if (selectionYear) experience.selectionYear = selectionYear.trim();
    if (difficultyLevel) experience.difficultyLevel = difficultyLevel;
    if (overallExperience) experience.overallExperience = overallExperience.trim();
    if (preparationStrategy) experience.preparationStrategy = preparationStrategy.trim();
    if (tips !== undefined) experience.tips = tips.trim();

    if (rounds) {
      try {
        experience.rounds = typeof rounds === 'string' ? JSON.parse(rounds) : rounds;
      } catch (e) {
        // ignore parse error if unchanged
      }
    }

    if (req.file) {
      experience.pdfAttachment = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
      };
    }

    // Reset status to Pending Review after edit
    experience.status = 'Pending Review';
    experience.rejectionReason = '';
    await experience.save();

    res.status(200).json({
      success: true,
      message: 'Experience updated and resubmitted for review successfully.',
      experience,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's own submissions
 * @route   GET /api/student/my-submissions
 * @access  Private (student)
 */
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await InterviewExperience.find({ studentId: req.user._id })
      .populate('companyId', 'name logoUrl industry website')
      .populate('driveId', 'academicYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle bookmark for an approved experience
 * @route   POST /api/student/bookmarks/:experienceId
 * @access  Private (student)
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const studentId = req.user._id;

    const experience = await InterviewExperience.findById(experienceId);
    if (!experience || experience.status !== 'Approved') {
      return res.status(404).json({ success: false, message: 'Approved experience not found.' });
    }

    const existing = await Bookmark.findOne({ studentId, experienceId });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        bookmarked: false,
        message: 'Experience removed from bookmarks.',
      });
    } else {
      await Bookmark.create({ studentId, experienceId });
      return res.status(200).json({
        success: true,
        bookmarked: true,
        message: 'Experience saved to bookmarks.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's bookmarked experiences
 * @route   GET /api/student/bookmarks
 * @access  Private (student)
 */
const getMyBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ studentId: req.user._id })
      .populate({
        path: 'experienceId',
        populate: [
          { path: 'companyId', select: 'name industry logoUrl website tier' },
          { path: 'studentId', select: 'name rollNumber department' },
          { path: 'driveId', select: 'academicYear' },
        ],
      })
      .sort({ createdAt: -1 });

    const validBookmarks = bookmarks
      .filter((b) => b.experienceId !== null && b.experienceId.status === 'Approved')
      .map((b) => b.experienceId);

    res.status(200).json({
      success: true,
      count: validBookmarks.length,
      bookmarks: validBookmarks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get preparation trackers for student
 * @route   GET /api/student/prep-trackers
 * @access  Private (student)
 */
const getPrepTrackers = async (req, res, next) => {
  try {
    const trackers = await PreparationTracker.find({ studentId: req.user._id })
      .populate('companyId', 'name industry logoUrl website tier')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      trackers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new preparation tracker
 * @route   POST /api/student/prep-trackers
 * @access  Private (student)
 */
const createPrepTracker = async (req, res, next) => {
  try {
    const { companyId, targetRole, targetDate, notes } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Target company is required.' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Default roadmap checklist tasks
    const defaultTasks = [
      { title: 'Solve Top 50 LeetCode Medium DSA Problems', category: 'DSA & Coding', completed: false },
      { title: 'Revise DBMS (SQL, Normalization, ACID, Indexing)', category: 'Core Subjects (OS/DBMS/CN)', completed: false },
      { title: 'Revise Operating Systems (Process, Threads, Memory, Paging)', category: 'Core Subjects (OS/DBMS/CN)', completed: false },
      { title: 'Computer Networks (OSI, TCP/IP, DNS, HTTP/HTTPS)', category: 'Core Subjects (OS/DBMS/CN)', completed: false },
      { title: 'Review System Design Fundamentals & OOPs Concepts', category: 'System Design', completed: false },
      { title: `Read all interview experiences for ${company.name}`, category: 'Company Questions', completed: false },
      { title: 'Practice Quantitative & Logical Aptitude Mock Tests', category: 'Aptitude', completed: false },
      { title: 'Prepare STAR method answers for HR & Behavioral Round', category: 'HR & Behavioral', completed: false },
      { title: 'Review Resume projects and prepare architecture walkthroughs', category: 'Resume & Projects', completed: false },
    ];

    const tracker = await PreparationTracker.create({
      studentId: req.user._id,
      companyId,
      targetRole: targetRole || 'Software Development Engineer',
      targetDate: targetDate ? new Date(targetDate) : null,
      notes: notes || '',
      tasks: defaultTasks,
    });

    const populated = await PreparationTracker.findById(tracker._id).populate('companyId', 'name logoUrl industry');

    res.status(201).json({
      success: true,
      message: `Preparation roadmap for ${company.name} created!`,
      tracker: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle / update prep tracker task
 * @route   PUT /api/student/prep-trackers/:trackerId/tasks/:taskId
 * @access  Private (student)
 */
const toggleTrackerTask = async (req, res, next) => {
  try {
    const { trackerId, taskId } = req.params;
    const tracker = await PreparationTracker.findOne({ _id: trackerId, studentId: req.user._id });

    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Preparation tracker not found.' });
    }

    const task = tracker.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in tracker.' });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;

    await tracker.save();

    res.status(200).json({
      success: true,
      tracker,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vote helpful on interview experience
 * @route   POST /api/student/experiences/:id/helpful
 * @access  Private (all logged in)
 */
const voteHelpful = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }

    res.status(200).json({
      success: true,
      helpfulCount: experience.helpfulCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
