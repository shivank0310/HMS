export type RoleKey = 'doctor' | 'patient' | 'admin' | 'insurance' | 'billing';
export type BackendRole =
  | 'hospital_admin'
  | 'doctor'
  | 'clinical_staff'
  | 'lab_staff'
  | 'pharmacist'
  | 'insurance'
  | 'patient';

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
  id: string;
  email: string;
  name: string;
  role: string;
  backendRole: BackendRole;
  accessToken: string;
  refreshToken: string;
  icon: string;
  title: string;
  subtitle: string;
  search: string;
  sidebarLabel: string;
  menu: RoleMenuItem[];
  activeRole: RoleKey;
}

export interface DashboardChainModule {
  module: string;
  channel: string | null;
  chaincode: string | null;
  databaseCount: number;
  syncedCount: number;
  failedCount: number;
  onChainCount: number;
}

export interface DashboardApiData {
  role: BackendRole;
  mspId: string;
  generatedAt: string;
  metrics: Record<string, string | number | null>;
  records: Record<string, unknown[]>;
  blockchain: {
    modules: DashboardChainModule[];
    note?: string;
  };
}

export interface DashboardComponentProps {
  activeMenu: string;
  dashboardData?: DashboardApiData | null;
  isLoading?: boolean;
  error?: string;
  accessToken?: string;
  patientId?: string;
  onSelectMenu?: (label: string) => void;
}
