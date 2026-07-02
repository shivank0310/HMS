import { useState, type ReactNode } from 'react';
import type { SessionUser } from '@/types';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './AppShell.css';

interface AppShellProps {
  user: SessionUser;
  activeMenu: string;
  onSelectMenu: (label: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({ user, activeMenu, onSelectMenu, onLogout, children }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const selectMenu = (label: string) => {
    onSelectMenu(label);
    setSidebarOpen(false);
  };

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <button className="sidebar-backdrop" type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
      <Sidebar user={user} activeMenu={activeMenu} onSelectMenu={selectMenu} onLogout={onLogout} />
      <main className="main-content">
        <TopBar
          title={user.title}
          subtitle={user.subtitle}
          search={user.search}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        {children}
      </main>
    </div>
  );
}
