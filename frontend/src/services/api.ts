const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:4000');

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  mspId: string;
  fullName?: string;
  phone?: string | null;
  isActive?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Unable to complete request');
  }

  return payload.data as T;
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(payload: RegisterPayload) {
  return request<AuthUser>('/api/auth/register-user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
