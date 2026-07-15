const treatmentRepo = require('../repositories/treatment.repository');
const auditService = require('./audit.service');
const syncService = require('../blockchain/syncService');
const { generateId } = require('../utils/id');
const ApiError = require('../utils/ApiError');

function buildSuggestedPlan({ reason = '', notes = '' }) {
  const text = `${reason} ${notes}`.toLowerCase();

  if (text.includes('fever') || text.includes('cough') || text.includes('cold')) {
    return {
      diagnosis: 'Respiratory infection or viral syndrome',
      plan: 'Rest, hydration, temperature monitoring, symptomatic medication, and follow-up if symptoms worsen.',
      urgency: 'routine',
    };
  }

  if (text.includes('chest') || text.includes('heart') || text.includes('cardio')) {
    return {
      diagnosis: 'Cardiac evaluation required',
      plan: 'ECG review, vitals monitoring, cardiology follow-up, and escalation for any worsening chest symptoms.',
      urgency: 'urgent',
    };
  }

  if (text.includes('diabetes') || text.includes('sugar') || text.includes('glucose')) {
    return {
      diagnosis: 'Metabolic / diabetes follow-up',
      plan: 'Blood glucose tracking, diet review, medication adherence check, and HbA1c follow-up.',
      urgency: 'routine',
    };
  }

  if (text.includes('pain') || text.includes('joint') || text.includes('bone') || text.includes('fracture')) {
    return {
      diagnosis: 'Musculoskeletal assessment',
      plan: 'Pain assessment, imaging if needed, rest/immobilization guidance, and specialist review.',
      urgency: 'routine',
    };
  }

  return {
    diagnosis: 'Clinical assessment required',
    plan: 'Full clinical examination, vitals review, relevant tests, and follow-up based on findings.',
    urgency: 'routine',
  };
}

async function create(data, mspId = 'ClinicalStaffMSP', options = {}) {
  const id = generateId('trt');
  const suggestion = options.suggestion || buildSuggestedPlan({ reason: data.reason, notes: data.notes });
  const record = {
    id,
    patientId: data.patientId,
    doctorId: data.doctorId || null,
    diagnosis: data.diagnosis || suggestion.diagnosis || null,
    status: options.status || 'planned',
    notes: data.notes || null,
    vitals: data.vitals || {},
    metadata: {
      ...(data.metadata || {}),
      suggestion,
      sourceAppointmentId: data.sourceAppointmentId || null,
      appointmentReason: data.reason || null,
    },
  };

  const sync = await syncService.syncToChain('treatment', mspId, record);
  const saved = await treatmentRepo.insert({ ...record, blockchain: sync.blockchain });
  await auditService.log({
    userId: data.userId || null,
    mspId,
    action: 'treatment.created',
    resource: 'treatment',
    resourceId: saved.id,
    metadata: {
      patientId: saved.patientId,
      doctorId: saved.doctorId,
      appointmentId: data.sourceAppointmentId || null,
      suggestion,
    },
  });
  return saved;
}

async function list(filters = {}) {
  if (filters.patientId) return treatmentRepo.findAll({ patientId: filters.patientId });
  if (filters.doctorId) return treatmentRepo.findAll({ doctorId: filters.doctorId });
  return treatmentRepo.findAll();
}

async function getById(id) {
  const item = await treatmentRepo.findById(id);
  if (!item) throw new ApiError('Treatment not found', 404);
  return item;
}

async function update(id, data, mspId) {
  const existing = await getById(id);
  const merged = {
    ...existing,
    diagnosis: data.diagnosis ?? existing.diagnosis,
    status: data.status ?? existing.status,
    notes: data.notes ?? existing.notes,
    vitals: data.vitals ?? existing.vitals,
    metadata: { ...(existing.metadata || {}), ...(data.metadata || {}), ...data },
  };

  const sync = await syncService.syncToChain('treatment', mspId || 'ClinicalStaffMSP', merged, 'update');
  return treatmentRepo.update(id, {
    diagnosis: merged.diagnosis,
    status: merged.status,
    notes: merged.notes,
    vitals: merged.vitals,
    metadata: merged.metadata,
    blockchain: sync.blockchain,
  });
}

async function addNotes(id, notes) {
  const existing = await getById(id);
  return treatmentRepo.update(id, { notes: `${existing.notes || ''}\n${notes}`.trim() });
}

async function addVitals(id, vitals) {
  await getById(id);
  return treatmentRepo.update(id, { vitals });
}

async function discharge(id, mspId) {
  const existing = await getById(id);
  const merged = { ...existing, status: 'discharged' };
  const sync = await syncService.syncToChain('treatment', mspId || 'ClinicalStaffMSP', merged, 'update');
  return treatmentRepo.update(id, { status: 'discharged', blockchain: sync.blockchain });
}

async function refer(id, referral) {
  const existing = await getById(id);
  return treatmentRepo.update(id, {
    metadata: { ...(existing.metadata || {}), referral },
    status: 'referred',
  });
}

module.exports = { create, list, getById, update, addNotes, addVitals, discharge, refer, buildSuggestedPlan };
