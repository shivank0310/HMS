const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtConfig = require('../config/jwt');
const userRepo = require('../repositories/user.repository');
const { refreshTokenRepo } = require('../repositories/misc.repository');
const { generateId } = require('../utils/id');
const { ROLE_TO_MSP, ROLES } = require('../utils/roles');
const ApiError = require('../utils/ApiError');

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, mspId: user.mspId },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, jwtConfig.secret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

async function registerUser(payload) {
  const existing = await userRepo.findByEmail(payload.email);
  if (existing) throw new ApiError('Email already registered', 409);

  const role = payload.role || ROLES.PATIENT;
  const user = await userRepo.insert({
    id: generateId('usr'),
    email: payload.email,
    passwordHash: await bcrypt.hash(payload.password, 10),
    role,
    mspId: ROLE_TO_MSP[role] || 'PatientAccessMSP',
    fullName: payload.fullName || payload.full_name,
    phone: payload.phone || null,
  });

  return sanitizeUser(user);
}

async function login(email, password) {
  const user = await userRepo.findByEmail(email);
  if (!user || !user.isActive) throw new ApiError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError('Invalid credentials', 401);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await refreshTokenRepo.insert({
    id: generateId('rt'),
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

async function refreshToken(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.secret);
  } catch {
    throw new ApiError('Invalid refresh token', 401);
  }
  if (decoded.type !== 'refresh') throw new ApiError('Invalid refresh token', 401);

  const user = await userRepo.findById(decoded.sub);
  if (!user) throw new ApiError('User not found', 404);

  return { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError('User not found', 404);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError('Current password is incorrect', 400);
  await userRepo.update(userId, { passwordHash: await bcrypt.hash(newPassword, 10) });
}

async function seedDefaultUsers() {
  const defaults = [
    { email: 'admin@hospital.com', password: 'Admin@123', role: ROLES.HOSPITAL_ADMIN, fullName: 'Hospital Admin' },
    { email: 'doctor@hospital.com', password: 'Doctor@123', role: ROLES.DOCTOR, fullName: 'Dr. Smith' },
    { email: 'patient@hospital.com', password: 'Patient@123', role: ROLES.PATIENT, fullName: 'John Patient' },
    { email: 'insurance@hospital.com', password: 'Insurance@123', role: ROLES.INSURANCE, fullName: 'Insurance Officer' },
    { email: 'pharmacy@hospital.com', password: 'Pharmacy@123', role: ROLES.PHARMACIST, fullName: 'Pharmacy Manager' },
  ];

  for (const item of defaults) {
    if (!(await userRepo.findByEmail(item.email))) {
      await registerUser(item);
    }
  }
}

module.exports = {
  registerUser,
  login,
  refreshToken,
  changePassword,
  seedDefaultUsers,
  signAccessToken,
  sanitizeUser,
};
