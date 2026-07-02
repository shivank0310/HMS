module.exports = {
  secret: process.env.JWT_SECRET || 'medichain-dev-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
