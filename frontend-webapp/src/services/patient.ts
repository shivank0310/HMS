import { request } from '@/services/api';

export interface PatientRecord {
  id: string;
  userId?: string | null;
  mrn?: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  allergies?: string[];
  emergencyContact?: unknown;
  status?: string;
  metadata?: Record<string, unknown>;
  blockchain?: {
    synced?: boolean;
    [key: string]: unknown;
  };
  chainVerification?: {
    verified: boolean;
    [key: string]: unknown;
  };
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId?: string | null;
  scheduledAt: string;
  status?: string;
  reason?: string | null;
  notes?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface MedicalHistoryRecord {
  treatments: unknown[];
  diagnoses: unknown[];
  prescriptions: unknown[];
}

export interface ShareRecordPayload {
  patientId: string;
  sharedWith: string;
  recordType: string;
  recordId?: string;
  expiresAt?: string;
}

export interface DocumentUploadPayload {
  patientId: string;
  file: File;
  metadata?: Record<string, unknown>;
}

export interface RecordUpdatePayload {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  metadata?: Record<string, unknown>;
}

export interface AppointmentCreatePayload {
  patientId: string;
  doctorId?: string;
  scheduledAt: string;
  reason?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

function toFormData(payload: DocumentUploadPayload) {
  const formData = new FormData();
  formData.append('patientId', payload.patientId);
  formData.append('document', payload.file);
  if (payload.metadata) {
    formData.append('metadata', JSON.stringify(payload.metadata));
  }
  return formData;
}

export function getPatient(accessToken: string, patientId: string, verify = true) {
  const verifyQuery = verify ? '?verify=true' : '';
  return request<PatientRecord>(`/api/patients/${patientId}${verifyQuery}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function listPatients(accessToken: string) {
  return request<PatientRecord[]>('/api/patients', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function updatePatient(accessToken: string, patientId: string, payload: RecordUpdatePayload) {
  return request<PatientRecord>(`/api/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getPatientHistory(accessToken: string, patientId: string) {
  return request<MedicalHistoryRecord>(`/api/patients/history?patientId=${patientId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getPatientMedicalHistory(accessToken: string, patientId: string) {
  return request<MedicalHistoryRecord>(`/api/patients/medical-history?patientId=${patientId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getPatientAppointments(accessToken: string, patientId: string) {
  return request<AppointmentRecord[]>(`/api/patients/appointments?patientId=${patientId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getPatientPrescriptions(accessToken: string, patientId: string) {
  return request<unknown[]>(`/api/patients/prescriptions?patientId=${patientId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function bookAppointment(accessToken: string, payload: AppointmentCreatePayload) {
  return request<AppointmentRecord>('/api/appointments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function uploadPatientDocument(accessToken: string, payload: DocumentUploadPayload) {
  return request<unknown>('/api/patients/upload-document', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: toFormData(payload),
  });
}

export function sharePatientRecord(accessToken: string, payload: ShareRecordPayload) {
  return request<unknown>('/api/patients/share-record', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function revokeSharedRecord(accessToken: string, shareId: string) {
  return request<unknown>(`/api/patients/share-record/${shareId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
