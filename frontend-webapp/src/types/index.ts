export type RoleKey = 'doctor' | 'patient' | 'admin' | 'insurance' | 'billing';

export interface RoleMenuItem {
  icon: string;
  label: string;
  dash: RoleKey;
}

export interface RoleConfig {
  key: RoleKey;
  name: string;
  role: string;
  icon: string;
  title: string;
  subtitle: string;
  search: string;
  sidebarLabel: string;
  menu: RoleMenuItem[];
}

export interface SessionUser {
  name: string;
  role: string;
  icon: string;
  title: string;
  subtitle: string;
  search: string;
  sidebarLabel: string;
  menu: RoleMenuItem[];
  activeRole: RoleKey;
}
