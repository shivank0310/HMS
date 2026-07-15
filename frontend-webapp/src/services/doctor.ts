import { request } from '@/services/api';

export interface DoctorRecord {
  id: string;
  userId?: string | null;
  specialization?: string | null;
  licenseNumber?: string | null;
  department?: string | null;
  metadata?: Record<string, unknown>;
}

export function listDoctors(accessToken: string, department?: string) {
  const query = department ? `?department=${encodeURIComponent(department)}` : '';
  return request<DoctorRecord[]>(`/api/doctors${query}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
