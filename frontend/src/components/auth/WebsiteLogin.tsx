import { useState } from 'react';
import { login, registerUser, type LoginResponse } from '@/services/api';
import { webappDashboardUrl } from '@/utils/webapp';
import './WebsiteLogin.css';

const demoAccounts = [
  { icon: '👨‍⚕️', label: 'Doctor', role: 'doctor', email: 'doctor@hospital.com', password: 'Doctor@123' },
  { icon: '👤', label: 'Patient', role: 'patient', email: 'patient@hospital.com', password: 'Patient@123' },
  { icon: '🏥', label: 'Hospital Admin', role: 'hospital_admin', email: 'admin@hospital.com', password: 'Admin@123' },
  { icon: '🛡️', label: 'Insurance', role: 'insurance', email: 'insurance@hospital.com', password: 'Insurance@123' },
  { icon: '💊', label: 'Billing & Pharmacy', role: 'pharmacist', email: 'pharmacy@hospital.com', password: 'Pharmacy@123' },
] as const;

const departmentOptions = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopaedics',
  'Paediatrics',
  'Gynecology',
  'Dermatology',
  'Psychiatry',
  'Oncology',
  'ENT',
  'Urology',
  'Pathology',
  'ICU',
];

type AuthMode = 'login' | 'create';

function encodeSession(response: LoginResponse) {
  return window.btoa(encodeURIComponent(JSON.stringify(response)));
}

export default function WebsiteLogin() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedEmail, setSelectedEmail] = useState<string>(demoAccounts[0].email);
  const [selectedRole, setSelectedRole] = useState<string>(demoAccounts[0].role);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState<string>(demoAccounts[0].email);
  const [password, setPassword] = useState<string>(demoAccounts[0].password);
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const selectAccount = (account: (typeof demoAccounts)[number]) => {
    setSelectedEmail(account.email);
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(mode === 'login' ? account.password : '');
    if (account.role !== 'doctor') {
      setDepartment('');
      setSpecialization('');
      setLicenseNumber('');
    }
    setError('');
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    if (nextMode === 'login') {
      const account = demoAccounts.find((item) => item.email === selectedEmail) ?? demoAccounts[0];
      setEmail(account.email);
      setPassword(account.password);
      return;
    }
    setEmail('');
    setPassword('');
    setDepartment('');
    setSpecialization('');
    setLicenseNumber('');
  };

  const openDashboard = (response: LoginResponse) => {
    window.location.href = `${webappDashboardUrl}#session=${encodeSession(response)}`;
  };

  const submitLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const response = await login(email.trim(), password);
      openDashboard(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !selectedRole) {
      setError('Please enter name, role, email, and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        phone: phone.trim() || undefined,
        department: selectedRole === 'doctor' ? department.trim() || undefined : undefined,
        specialization: selectedRole === 'doctor' ? specialization.trim() || undefined : undefined,
        licenseNumber: selectedRole === 'doctor' ? licenseNumber.trim() || undefined : undefined,
      });
      const response = await login(email.trim(), password);
      openDashboard(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAuth = () => {
    if (mode === 'login') {
      submitLogin();
      return;
    }
    submitCreateAccount();
  };

  return (
    <main className="website-login-page">
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />
      <a className="login-back-link" href="/">
        ← Back to MediChain website
      </a>

      <section className="website-login" id="login">
      <div className="container website-login-grid">
        <div className="login-copy">
          <div className="section-label">Secure Access</div>
          <h1 className="section-title">Login from the website, open the correct dashboard.</h1>
          <p className="section-desc">
            Select your role, authenticate through the backend API, and MediChain will open the
            matching webapp dashboard with the same credentials.
          </p>
          <div className="login-trust-grid">
            <span>JWT session</span>
            <span>Role MSP mapping</span>
            <span>Fabric-backed dashboard</span>
          </div>
        </div>

        <div className="website-login-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => switchMode('login')}>
              Sign in
            </button>
            <button className={mode === 'create' ? 'active' : ''} type="button" onClick={() => switchMode('create')}>
              Create account
            </button>
          </div>

          <h3>{mode === 'login' ? 'Sign in to MediChain HMS' : 'Create role account'}</h3>
          <div className="website-role-grid">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                className={`website-role-card ${selectedRole === account.role ? 'selected' : ''}`}
                onClick={() => selectAccount(account)}
              >
                <span>{account.icon}</span>
                <strong>{account.label}</strong>
              </button>
            ))}
          </div>

          {mode === 'create' ? (
            <label className="website-field">
              <span>Full name</span>
              <input
                type="text"
                value={fullName}
                placeholder="Enter full name"
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>
          ) : null}

          {mode === 'create' && selectedRole === 'doctor' ? (
            <>
              <label className="website-field">
                <span>Department</span>
                <select value={department} onChange={(event) => setDepartment(event.target.value)} required>
                  <option value="">Select department</option>
                  {departmentOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="website-field">
                <span>Specialization optional</span>
                <input
                  type="text"
                  value={specialization}
                  placeholder="Cardiologist, Surgeon..."
                  onChange={(event) => setSpecialization(event.target.value)}
                />
              </label>
              <label className="website-field">
                <span>License number optional</span>
                <input
                  type="text"
                  value={licenseNumber}
                  placeholder="Medical council ID"
                  onChange={(event) => setLicenseNumber(event.target.value)}
                />
              </label>
            </>
          ) : null}

          <label className="website-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              placeholder={mode === 'login' ? 'Select demo account or enter email' : 'name@hospital.com'}
              onChange={(event) => {
                setEmail(event.target.value);
                setSelectedEmail(event.target.value);
              }}
            />
          </label>

          <label className="website-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              placeholder={mode === 'login' ? 'Enter password' : 'Minimum 6 characters'}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitAuth();
                }
              }}
            />
          </label>

          {mode === 'create' ? (
            <label className="website-field">
              <span>Phone optional</span>
              <input
                type="tel"
                value={phone}
                placeholder="+91 98765 43210"
                onChange={(event) => setPhone(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submitAuth();
                  }
                }}
              />
            </label>
          ) : null}

          <button className="website-login-submit" type="button" onClick={submitAuth} disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Login and Open Dashboard' : 'Create Account and Open Dashboard'}
          </button>
          {error ? <div className="website-login-error">{error}</div> : null}
          <p className="website-login-hint">
            {mode === 'login'
              ? 'Demo roles prefill credentials. Custom users can sign in with the same email and password created here.'
              : 'New accounts are saved in the backend with the selected role and MSP mapping.'}
          </p>
        </div>
      </div>
    </section>
    </main>
  );
}
