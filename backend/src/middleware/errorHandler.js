const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected server error occurred.';

  // Handle MongoDB Duplicate Key (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const keyPattern = err.keyPattern || {};

    if (keyPattern.rollNumber) {
      message = 'Duplicate error: A student with this Roll Number is already registered.';
    } else if (keyPattern.email) {
      message = 'Duplicate error: An account with this email address is already registered.';
    } else if (keyPattern.name && req.originalUrl.includes('companies')) {
      message = 'Duplicate error: A company with this name already exists.';
    } else if (keyPattern.studentId && keyPattern.companyId && keyPattern.driveId) {
      message = 'Duplicate error: A placement record for this student and drive already exists.';
    } else if (keyPattern.studentId && keyPattern.driveId) {
      message = 'Duplicate error: You have already submitted an interview experience for this placement drive. You can edit your existing submission.';
    } else if (keyPattern.studentId && keyPattern.experienceId) {
      message = 'Duplicate error: You have already bookmarked this interview experience.';
    } else if (keyPattern.studentId && keyPattern.companyId) {
      message = 'Duplicate error: A preparation tracker already exists for this company.';
    } else {
      const keys = Object.keys(keyPattern).join(', ');
      message = `Duplicate record error: A record with matching [${keys}] already exists.`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Validation failed: ${errors.join(', ')}`;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid identifier: ${err.value}`;
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file is too large. Maximum permitted file size is 10MB.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
