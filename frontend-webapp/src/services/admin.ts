import { request } from '@/services/api';
import type { DoctorRecord } from '@/services/doctor';
import type { AuthUser } from '@/services/api';

export interface DoctorRegistrationPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  metadata?: Record<string, unknown>;
}

export interface DoctorRegistrationResponse {
  user: AuthUser;
  doctor: DoctorRecord;
}

export function registerDoctor(accessToken: string, payload: DoctorRegistrationPayload) {
  return request<DoctorRegistrationResponse>('/api/admin/doctors', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
