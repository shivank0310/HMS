const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error('%s %s - %s', req.method, req.originalUrl, err.stack || message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details || undefined,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
