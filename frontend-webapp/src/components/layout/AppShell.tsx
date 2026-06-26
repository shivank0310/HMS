import type { ReactNode } from 'react';
import type { SessionUser } from '@/types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppShellProps {
  user: SessionUser;
  activeMenu: string;
  onSelectMenu: (label: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({ user, activeMenu, onSelectMenu, onLogout, children }: AppShellProps) {
  return (
    <div className="dashboard-container">
      <Sidebar user={user} activeMenu={activeMenu} onSelectMenu={onSelectMenu} onLogout={onLogout} />
      <main className="main-content">
        <TopBar title={user.title} subtitle={user.subtitle} search={user.search} />
        {children}
      </main>
    </div>
  );
}
