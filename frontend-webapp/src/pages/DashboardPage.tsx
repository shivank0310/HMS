import { useEffect, useState } from 'react';
import { roleConfigs } from '@/data/roles';
import { getRoleDashboard } from '@/services/api';
import type { DashboardApiData, SessionUser } from '@/types';
import AppShell from '@/components/layout/AppShell';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import InsuranceDashboard from '@/components/dashboards/InsuranceDashboard';
import BillingDashboard from '@/components/dashboards/BillingDashboard';
import '@/components/ui/ui.css';
import './DashboardPage.css';

interface DashboardPageProps {
  user: SessionUser;
  activeMenu: string;
  onSelectMenu: (label: string) => void;
  onLogout: () => void;
}

const dashboardMap = {
  doctor: DoctorDashboard,
  patient: PatientDashboard,
  admin: AdminDashboard,
  insurance: InsuranceDashboard,
  billing: BillingDashboard,
};

export default function DashboardPage({ user, activeMenu, onSelectMenu, onLogout }: DashboardPageProps) {
  const roleKey = user.activeRole;
  const fallback = roleConfigs[roleKey];
  const Dashboard = dashboardMap[roleKey];
  const [dashboardData, setDashboardData] = useState<DashboardApiData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setIsLoadingDashboard(true);
    setDashboardError('');

    getRoleDashboard(user.accessToken)
      .then((data) => {
        if (!cancelled) {
          setDashboardData(data);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setDashboardError(error.message || 'Dashboard API is unavailable');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingDashboard(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user.accessToken]);

  return (
    <AppShell user={user} activeMenu={activeMenu} onSelectMenu={onSelectMenu} onLogout={onLogout}>
      <div className="dashboard-shell">
        <div className="dashboard-role-flag">
          <span className="badge b-purple">{fallback.title}</span>
          <span className="dashboard-role-subtitle">{fallback.subtitle}</span>
          <span className={`dashboard-api-state ${dashboardError ? 'is-error' : isLoadingDashboard ? 'is-loading' : ''}`}>
            {dashboardError ? 'API needs attention' : isLoadingDashboard ? 'Loading role API...' : 'Role API connected'}
          </span>
        </div>
        <Dashboard
          activeMenu={activeMenu}
          dashboardData={dashboardData}
          isLoading={isLoadingDashboard}
          error={dashboardError}
          accessToken={user.accessToken}
          patientId={user.id}
          onSelectMenu={onSelectMenu}
        />
      </div>
    </AppShell>
  );
}
