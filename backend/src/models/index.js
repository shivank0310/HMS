const mongoose = require('mongoose');

const baseOpts = { timestamps: true, versionKey: false };

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
  mspId: { type: String, required: true },
  fullName: String,
  phone: String,
  isActive: { type: Boolean, default: true },
}, baseOpts);

const RefreshTokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { ...baseOpts, timestamps: { createdAt: true, updatedAt: false } });

const BlockchainMetaSchema = new mongoose.Schema({
  recordId: String,
  channel: String,
  chaincode: String,
  synced: { type: Boolean, default: false },
  syncedAt: Date,
  onChainSnapshot: mongoose.Schema.Types.Mixed,
  lastError: String,
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: String,
  mrn: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  allergies: [String],
  emergencyContact: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const DoctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, index: true },
  specialization: String,
  licenseNumber: String,
  department: String,
  metadata: mongoose.Schema.Types.Mixed,
}, baseOpts);

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  doctorId: String,
  scheduledAt: { type: Date, required: true },
  status: { type: String, default: 'scheduled' },
  reason: String,
  notes: String,
  checkedInAt: Date,
  checkedOutAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, baseOpts);

const TreatmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  doctorId: String,
  diagnosis: String,
  status: { type: String, default: 'active' },
  notes: String,
  vitals: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const DiagnosisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  reportUrl: String,
  findings: String,
  status: { type: String, default: 'pending' },
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const PharmacyInventorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  drugName: { type: String, required: true },
  sku: { type: String, unique: true, sparse: true },
  quantity: { type: Number, default: 0 },
  unit: String,
  expiryDate: String,
  metadata: mongoose.Schema.Types.Mixed,
}, baseOpts);

const PharmacyDispenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  prescriptionId: String,
  drugName: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: 'dispensed' },
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const BillingRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'pending' },
  invoiceNumber: String,
  lineItems: [mongoose.Schema.Types.Mixed],
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const InsuranceClaimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  billingId: String,
  policyNumber: String,
  amount: Number,
  status: { type: String, default: 'submitted' },
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const ConsentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  granteeId: { type: String, required: true },
  scope: { type: String, required: true },
  status: { type: String, default: 'active' },
  emergency: { type: Boolean, default: false },
  expiresAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, baseOpts);

const EmergencyAccessSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  grantedBy: String,
  reason: String,
  status: { type: String, default: 'active' },
  closedAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  mimeType: String,
  metadata: mongoose.Schema.Types.Mixed,
}, baseOpts);

const SharedRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  sharedWith: { type: String, required: true },
  recordType: String,
  recordId: String,
  expiresAt: Date,
}, baseOpts);

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: String,
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  mspId: String,
  ipAddress: String,
  metadata: mongoose.Schema.Types.Mixed,
  blockchain: BlockchainMetaSchema,
}, baseOpts);

const AiRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  type: { type: String, required: true },
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
}, baseOpts);

module.exports = {
  User: mongoose.model('User', UserSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  Patient: mongoose.model('Patient', PatientSchema),
  Doctor: mongoose.model('Doctor', DoctorSchema),
  Appointment: mongoose.model('Appointment', AppointmentSchema),
  Treatment: mongoose.model('Treatment', TreatmentSchema),
  Diagnosis: mongoose.model('Diagnosis', DiagnosisSchema),
  PharmacyInventory: mongoose.model('PharmacyInventory', PharmacyInventorySchema),
  PharmacyDispense: mongoose.model('PharmacyDispense', PharmacyDispenseSchema),
  BillingRecord: mongoose.model('BillingRecord', BillingRecordSchema),
  InsuranceClaim: mongoose.model('InsuranceClaim', InsuranceClaimSchema),
  Consent: mongoose.model('Consent', ConsentSchema),
  EmergencyAccess: mongoose.model('EmergencyAccess', EmergencyAccessSchema),
  Document: mongoose.model('Document', DocumentSchema),
  SharedRecord: mongoose.model('SharedRecord', SharedRecordSchema),
  AuditLog: mongoose.model('AuditLog', AuditLogSchema),
  AiRequest: mongoose.model('AiRequest', AiRequestSchema),
};
