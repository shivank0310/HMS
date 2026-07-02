const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const ApiError = require('../utils/ApiError');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError('Authentication required', 401));
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, jwtConfig.secret);
    return next();
  } catch {
    return next(new ApiError('Invalid or expired token', 401));
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    req.user = jwt.verify(header.slice(7), jwtConfig.secret);
  } catch {
    // ignore invalid optional token
  }
  return next();
}

module.exports = { authenticate, optionalAuth };
