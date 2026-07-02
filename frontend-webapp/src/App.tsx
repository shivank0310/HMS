import { useEffect, useState } from 'react';
import DashboardPage from '@/pages/DashboardPage';
import { getProfile } from '@/services/api';
import {
  clearSession,
  consumeSessionFromHash,
  createSessionUser,
  getWebsiteLoginUrl,
  loadSession,
} from '@/services/session';
import type { SessionUser } from '@/types';
import '@/components/ui/ui.css';
import '@/components/layout/AppShell.css';

type Screen = 'dashboard' | 'loading' | 'gate';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [activeMenu, setActiveMenu] = useState('Overview');

  useEffect(() => {
    const incoming = consumeSessionFromHash();
    if (incoming) {
      const user = createSessionUser(incoming.user, incoming.accessToken, incoming.refreshToken);
      setSessionUser(user);
      setActiveMenu(user.menu[0]?.label ?? 'Overview');
      setScreen('dashboard');
      return;
    }

    const stored = loadSession();
    if (!stored) {
      setScreen('gate');
      return;
    }

    setScreen('loading');
    getProfile(stored.accessToken)
      .then((profile) => {
        const user = createSessionUser(profile, stored.accessToken, stored.refreshToken);
        setSessionUser(user);
        setActiveMenu(user.menu[0]?.label ?? 'Overview');
        setScreen('dashboard');
      })
      .catch(() => {
        clearSession();
        setScreen('gate');
      });
  }, []);

  const handleLogout = () => {
    clearSession();
    setSessionUser(null);
    setActiveMenu('Overview');
    window.location.href = getWebsiteLoginUrl();
  };

  if (screen === 'loading') {
    return (
      <main className="app-loading">
        <div className="login-logo">⚕</div>
        <p>Restoring your secure MediChain session...</p>
      </main>
    );
  }

  if (screen === 'gate' || !sessionUser) {
    return (
      <main className="app-loading dashboard-gate">
        <div className="login-logo">⚕</div>
        <h1>MediChain HMS Dashboard</h1>
        <p>Please sign in from the main website to open your role dashboard.</p>
        <a className="btn btn-primary" href={getWebsiteLoginUrl()}>
          Go to Website Login
        </a>
      </main>
    );
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
