import { useState } from 'react';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import { roleConfigs } from '@/data/roles';
import type { RoleKey, SessionUser } from '@/types';

type Screen = 'home' | 'auth' | 'dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [activeMenu, setActiveMenu] = useState('Overview');

  const handleStartSignIn = () => {
    setScreen('auth');
  };

  const handleLogin = (role: RoleKey) => {
    const config = roleConfigs[role];

    setSessionUser({
      name: config.name,
      role: config.role,
      icon: config.icon,
      title: config.title,
      subtitle: config.subtitle,
      search: config.search,
      sidebarLabel: config.sidebarLabel,
      menu: config.menu,
      activeRole: role,
    });
    setActiveMenu(config.menu[0]?.label ?? 'Overview');
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setSessionUser(null);
    setScreen('home');
    setActiveMenu('Overview');
  };

  if (screen === 'home') {
    return <HomePage onSignIn={handleStartSignIn} />;
  }

  if (screen === 'auth') {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (!sessionUser) {
    return <HomePage onSignIn={handleStartSignIn} />;
  }

  return (
    <DashboardPage
      user={sessionUser}
      activeMenu={activeMenu}
      onSelectMenu={setActiveMenu}
      onLogout={handleLogout}
    />
  );
}
