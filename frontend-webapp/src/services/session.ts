import { roleConfigs } from '@/data/roles';
import type { AuthUser, LoginResponse } from '@/services/api';
import type { BackendRole, RoleKey, SessionUser } from '@/types';

const STORAGE_KEY = 'medichain.session';
const HASH_SESSION_PREFIX = '#session=';

export const backendRoleToDashboard: Record<BackendRole, RoleKey> = {
  hospital_admin: 'admin',
  doctor: 'doctor',
  clinical_staff: 'doctor',
  lab_staff: 'doctor',
  pharmacist: 'billing',
  insurance: 'insurance',
  patient: 'patient',
};

interface StoredSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export function createSessionUser(user: AuthUser, accessToken: string, refreshToken: string): SessionUser {
  const activeRole = backendRoleToDashboard[user.role] ?? 'patient';
  const config = roleConfigs[activeRole];

  return {
    id: user.id,
    email: user.email,
    name: user.fullName || config.name,
    role: config.role,
    backendRole: user.role,
    accessToken,
    refreshToken,
    icon: config.icon,
    title: config.title,
    subtitle: config.subtitle,
    search: config.search,
    sidebarLabel: config.sidebarLabel,
    menu: config.menu,
    activeRole,
  };
}

export function saveSession(response: LoginResponse) {
  const stored: StoredSession = {
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function consumeSessionFromHash() {
  if (!window.location.hash.startsWith(HASH_SESSION_PREFIX)) return null;

  try {
    const encoded = window.location.hash.slice(HASH_SESSION_PREFIX.length);
    const response = JSON.parse(decodeURIComponent(window.atob(encoded))) as LoginResponse;
    if (!response.user || !response.accessToken || !response.refreshToken) return null;
    saveSession(response);
    window.history.replaceState(null, document.title, window.location.pathname);
    return response;
  } catch {
    window.history.replaceState(null, document.title, window.location.pathname);
    return null;
  }
}

export function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as StoredSession;
    if (!stored.user || !stored.accessToken || !stored.refreshToken) return null;
    return stored;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getWebsiteLoginUrl() {
  return import.meta.env.VITE_FRONTEND_LOGIN_URL ?? 'http://localhost:5173/login';
}
