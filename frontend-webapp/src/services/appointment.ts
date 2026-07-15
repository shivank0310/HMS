import { request } from '@/services/api';
import type { AppointmentRecord } from '@/services/patient';

export interface TreatmentSuggestion {
  diagnosis?: string | null;
  plan?: string | null;
  urgency?: string | null;
}

export interface TreatmentRecord {
  id: string;
  patientId: string;
  doctorId?: string | null;
  diagnosis?: string | null;
  status?: string;
  notes?: string | null;
  vitals?: Record<string, unknown>;
  metadata?: Record<string, unknown> & {
    sourceAppointmentId?: string | null;
    suggestion?: TreatmentSuggestion | null;
  };
}

export interface AppointmentAcceptResponse {
  appointment: AppointmentRecord;
  treatment: TreatmentRecord;
  suggestion?: TreatmentSuggestion | null;
}

export function acceptAppointment(accessToken: string, appointmentId: string) {
  return request<AppointmentAcceptResponse>(`/api/appointments/${appointmentId}/accept`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
