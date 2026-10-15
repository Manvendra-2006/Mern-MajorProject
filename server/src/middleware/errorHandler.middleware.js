const { ZodError } = require('zod');
const { sendError } = require('../utils/response');
const config = require('../config/environment');

const errorHandler = (err, req, res, next) => {
  // Zod validation error
  if (err instanceof ZodError) {
    const formatted = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, formatted);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `A record with this ${field} already exists.`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid resource identifier format: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired. Please log in again.', 401);
  }

  // Custom HTTP exceptions with status code
  const statusCode = err.statusCode || 500;
  const message = (statusCode === 500 && config.isProduction)
    ? 'Internal server error. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  if (statusCode === 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  }

  return sendError(res, message, statusCode, err.errors || null);
};

module.exports = errorHandler;
