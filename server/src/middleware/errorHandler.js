import multer from 'multer';

// Duplicate MongoDB key error → 409 message per unique field. These are a
// race-condition safety net: company.service.js already pre-checks
// companyName/companyEmail uniqueness, but a concurrent request can still
// hit the index directly between the check and the write.
const DUPLICATE_KEY_MESSAGES = {
  companyName: 'A company with this name already exists.',
  companyEmail: 'A company with this email address already exists.',
  employerUserId: 'Employer already has a company profile.',
};

export function errorHandler(error, req, res, next) {
  void req;
  void next;

  // Multer errors never carry a statusCode — map them explicitly instead of
  // falling through to 500.
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File exceeds the maximum allowed size of 2MB.',
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  }

  // Handle Mongoose duplicate key errors (E11000) globally
  if (error.code === 11000) {
    const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
    return res.status(409).json({
      success: false,
      message:
        DUPLICATE_KEY_MESSAGES[duplicateField] ||
        `A duplicate record with this ${duplicateField} already exists.`,
    });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
}
