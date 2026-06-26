import type { ReactElement } from 'react';
import { roleConfigs } from '@/data/roles';
import type { RoleKey, SessionUser } from '@/types';
import AppShell from '@/components/layout/AppShell';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import InsuranceDashboard from '@/components/dashboards/InsuranceDashboard';
import BillingDashboard from '@/components/dashboards/BillingDashboard';

interface DashboardPageProps {
  user: SessionUser;
  activeMenu: string;
  onSelectMenu: (label: string) => void;
  onLogout: () => void;
}

const dashboardMap: Record<RoleKey, ReactElement> = {
  doctor: <DoctorDashboard />,
  patient: <PatientDashboard />,
  admin: <AdminDashboard />,
  insurance: <InsuranceDashboard />,
  billing: <BillingDashboard />,
};

export default function DashboardPage({ user, activeMenu, onSelectMenu, onLogout }: DashboardPageProps) {
  const roleKey = user.activeRole;
  const fallback = roleConfigs[roleKey];

  return (
    <AppShell user={user} activeMenu={activeMenu} onSelectMenu={onSelectMenu} onLogout={onLogout}>
      <div className="dashboard-shell">
        <section className="dashboard-role-flag">
          <span className="badge b-purple">{fallback.title}</span>
          <span className="dashboard-role-subtitle">{fallback.subtitle}</span>
        </section>
        {dashboardMap[roleKey]}
      </div>
    </AppShell>
  );
}
