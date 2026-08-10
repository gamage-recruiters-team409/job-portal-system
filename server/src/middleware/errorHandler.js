export function errorHandler(error, req, res, next) {
  void req;
  void next;

  let statusCode = error.statusCode || 500;
  let message = statusCode === 500 ? 'Internal server error' : error.message;

  // Handle Mongoose duplicate key errors (E11000) globally
  if (error.code === 11000) {
    statusCode = 409;
    const field = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
    message = `A duplicate record with this ${field} already exists.`;
  }

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
}
