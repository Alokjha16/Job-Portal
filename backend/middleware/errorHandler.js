././const ApiResponse = require('../utils/apiResponse');

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Resource not found: ${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      console.error('Server Error:', err);
    }
    return ApiResponse.error(res, err.message, err.statusCode, err.details);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.badRequest(res, err.message, err.details);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.badRequest(res, 'Invalid JSON in request body');
  }

  // Default error
  return ApiResponse.serverError(res, 'An unexpected error occurred');
};

module.exports = { ApiError, notFound, errorHandler };
