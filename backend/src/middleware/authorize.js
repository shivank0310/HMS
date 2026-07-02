const ApiError = require('../utils/ApiError');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError('Authentication required', 401));
    if (!allowedRoles.length || allowedRoles.includes(req.user.role)) return next();
    return next(new ApiError('Insufficient permissions', 403));
  };
}

function authorizeMsp(...allowedMsps) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError('Authentication required', 401));
    if (!allowedMsps.length || allowedMsps.includes(req.user.mspId)) return next();
    return next(new ApiError('Insufficient MSP permissions', 403));
  };
}

module.exports = { authorize, authorizeMsp };
