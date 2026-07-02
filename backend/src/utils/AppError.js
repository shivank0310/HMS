const ApiError = require('../utils/ApiError');

class AppError extends ApiError {
  constructor(message, statusCode = 500, details = null) {
    super(message, statusCode, details);
    this.name = 'AppError';
  }
}

module.exports = AppError;
