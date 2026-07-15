const Joi = require('joi');

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  role: Joi.string().optional(),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  specialization: Joi.string().optional(),
  licenseNumber: Joi.string().optional(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const patient = Joi.object({
  fullName: Joi.string().required(),
  dateOfBirth: Joi.string().optional(),
  gender: Joi.string().optional(),
  bloodGroup: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().optional(),
  address: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const appointment = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().optional(),
  scheduledAt: Joi.string().required(),
  reason: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const treatment = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().optional(),
  diagnosis: Joi.string().optional(),
  notes: Joi.string().optional(),
  vitals: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

const billing = Joi.object({
  patientId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().optional(),
  invoiceNumber: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

module.exports = { login, register, changePassword, patient, appointment, treatment, billing };
