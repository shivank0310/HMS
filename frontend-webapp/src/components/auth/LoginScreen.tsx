import { useMemo, useState } from 'react';
import { loginRoles, roleConfigs } from '@/data/roles';
import type { RoleKey } from '@/types';
import Button from '@/components/ui/Button';

interface LoginScreenProps {
  onLogin: (role: RoleKey) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>('doctor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedRoleLabel = useMemo(() => {
    if (!selectedRole) {
      return 'Select a role to continue';
    }

    return roleConfigs[selectedRole].role;
  }, [selectedRole]);

  const submitLogin = () => {
    if (!selectedRole || !username.trim() || !password.trim()) {
      setError('Please select a role and fill in all fields.');
      return;
    }

    setError('');
    onLogin(selectedRole);
  };

  return (
    <div id="login-screen" className="login-screen">
      <div className="login-box">
        <div className="login-brand">
          <div className="login-logo">⚕</div>
          <h1>MediChain HMS</h1>
          <p>Hospital Management System v2.0</p>
        </div>

        <div className="login-card">
          <h2>Sign in to your portal</h2>

          <div className="form-group">
            <label>Select Your Role</label>
            <div className="role-cards">
              {loginRoles.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  className={`role-card ${selectedRole === role.key ? 'selected' : ''} ${
                    role.key === 'billing' ? 'role-card-span' : ''
                  }`}
                  onClick={() => setSelectedRole(role.key)}
                >
                  <div className="role-icon">{role.icon}</div>
                  <div className="role-name">{role.label}</div>
                </button>
              ))}
            </div>
            <p className="login-role-hint">{selectedRoleLabel}</p>
          </div>

          <div className="form-group">
            <label>Username / Employee ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. DR-001 or PT-2024-101"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitLogin();
                }
              }}
            />
          </div>

          <Button onClick={submitLogin} block>
            Sign In →
          </Button>

          {error ? <div className="login-error">{error}</div> : null}

          <p className="login-note">Demo: pick any role and enter any credentials.</p>
        </div>
      </div>
    </div>
  );
}
