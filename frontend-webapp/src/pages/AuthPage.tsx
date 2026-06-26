import LoginScreen from '@/components/auth/LoginScreen';
import type { RoleKey } from '@/types';

interface AuthPageProps {
  onLogin: (role: RoleKey) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  return <LoginScreen onLogin={onLogin} />;
}
