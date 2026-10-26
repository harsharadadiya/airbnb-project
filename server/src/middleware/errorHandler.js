// Central error handling. Every error thrown in a route ends up here.
// Express 5 automatically catches errors from async functions, so no try/catch is needed in controllers.
import { AppError } from '../utils/AppError.js';
import { isProduction } from '../config/env.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors;

  // Wrong ObjectId format, e.g. /api/listings/abc
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
    errors = undefined;
  }

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Please fix the highlighted fields';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Unique index broken, e.g. email already registered
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'value';
    message = field === 'email' ? 'An account with this email already exists' : `Duplicate ${field}`;
    errors = undefined;
  }

  // Bad or expired login token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Your session is not valid. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body is not valid JSON';
  }

  if (statusCode >= 500) {
    console.error('💥 Unexpected error:', err);
    // Do not leak internal details to users in production
    if (isProduction) message = 'Something went wrong on our side. Please try again.';
  }

  res.status(statusCode).json({
    message,
    ...(errors && { errors: Array.isArray(errors) ? errors : undefined }),
    ...(!isProduction && statusCode >= 500 && { stack: err.stack }),
  });
}
