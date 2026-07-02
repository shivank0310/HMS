import { useEffect, useState } from 'react';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  if (path === '/login') {
    return <LoginPage />;
  }

  return <HomePage />;
}
