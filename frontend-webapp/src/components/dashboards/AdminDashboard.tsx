import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ItemRow from '@/components/ui/ItemRow';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import BlockchainStatus from '@/components/dashboards/BlockchainStatus';
import { chainSyncedValue, metricValue } from '@/components/dashboards/dashboardMetrics';
import { registerDoctor, type DoctorRegistrationPayload } from '@/services/admin';
import type { DashboardComponentProps } from '@/types';
import './AdminDashboard.css';

const staffRows = [
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Cardiologist',
    department: 'Cardiology',
    shift: 'Morning',
    status: <Badge tone="success">On Duty</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    name: 'Nurse Anita Singh',
    role: 'Sr. Nurse',
    department: 'ICU',
    shift: 'Night',
    status: <Badge tone="success">On Duty</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    name: 'Dr. Meera Nair',
    role: 'Paediatrician',
    department: 'Paediatrics',
    shift: 'Morning',
    status: <Badge tone="warning">On Leave</Badge>,
    action: <Button variant="primary" size="sm">Reassign</Button>,
  },
  {
    name: 'Lab Tech Ravi Pal',
    role: 'Lab Technician',
    department: 'Pathology',
    shift: 'Afternoon',
    status: <Badge tone="info">Scheduled</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
];

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

const emptyDoctorForm: DoctorRegistrationPayload = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  licenseNumber: '',
  department: '',
  metadata: {},
};

export default function AdminDashboard({ activeMenu, dashboardData, isLoading, error, accessToken }: DashboardComponentProps) {
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [doctorMessage, setDoctorMessage] = useState('');
  const [doctorError, setDoctorError] = useState('');
  const [doctorSubmitting, setDoctorSubmitting] = useState(false);
  const [doctorDirectory, setDoctorDirectory] = useState(() => (dashboardData?.records?.doctors ?? []) as Record<string, unknown>[]);

  const isOverview = activeMenu === 'Operations Overview';
  const showMetrics = isOverview || activeMenu === 'Bed Management' || activeMenu === 'Staff Management';
  const showAlerts = isOverview || activeMenu === 'Bed Management' || activeMenu === 'Staff Management' || activeMenu === 'Compliance';
  const showBeds = isOverview || activeMenu === 'Bed Management' || activeMenu === 'Financials';
  const showStaff = isOverview || activeMenu === 'Staff Management';
  const showCompliance = isOverview || activeMenu === 'Compliance';

  useEffect(() => {
    setDoctorDirectory((dashboardData?.records?.doctors ?? []) as Record<string, unknown>[]);
  }, [dashboardData]);

  const registeredDoctors = useMemo(
    () => doctorDirectory.map((doctor) => ({
      id: String(doctor.id || doctor.userId || doctor.licenseNumber || doctor.fullName || 'doctor'),
      name: String(doctor.fullName || doctor.name || doctor.displayName || doctor.id || 'Doctor'),
      department: String(doctor.department || 'General Medicine'),
      specialization: String(doctor.specialization || 'Unspecified'),
      licenseNumber: String(doctor.licenseNumber || ''),
    })),
    [doctorDirectory],
  );

  const handleDoctorFormChange = (field: keyof DoctorRegistrationPayload) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setDoctorForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDoctorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!doctorForm.fullName || !doctorForm.email || !doctorForm.password || !doctorForm.department) {
      setDoctorError('Please fill in full name, email, password, and department.');
      return;
    }

    if (!accessToken) {
      setDoctorError('Missing admin session token.');
      return;
    }

    setDoctorSubmitting(true);
    setDoctorError('');
    setDoctorMessage('');

    try {
      const result = await registerDoctor(accessToken, doctorForm);
      setDoctorMessage(`Doctor account created for ${result.doctor.department || 'General Medicine'}.`);
      setDoctorDirectory((current) => [
        {
          id: result.doctor.id,
          userId: result.user.id,
          fullName: result.user.fullName || doctorForm.fullName,
          specialization: result.doctor.specialization || doctorForm.specialization || null,
          licenseNumber: result.doctor.licenseNumber || doctorForm.licenseNumber || null,
          department: result.doctor.department || doctorForm.department,
        },
        ...current,
      ]);
      setDoctorForm(emptyDoctorForm);
    } catch (submitError) {
      setDoctorError(submitError instanceof Error ? submitError.message : 'Unable to register doctor');
    } finally {
      setDoctorSubmitting(false);
    }
  };

  return (
    <div className="dashboard-tab admin-dashboard">
      <div className="tab-heading">
        <span>{activeMenu}</span>
      </div>
      <BlockchainStatus data={dashboardData} isLoading={isLoading} error={error} />
      {showMetrics ? (
      <div className="grid-4">
        <MetricCard icon="🏥" tone="cyan" label="Total Patients" value={metricValue(dashboardData, 'patients', 284)} note="From patient API + Fabric patientcc" />
        <MetricCard icon="🧾" tone="green" label="Pending Bills" value={metricValue(dashboardData, 'pendingBills', 24)} note="Billing records ready for review" />
        <MetricCard icon="👨‍⚕️" tone="amber" label="Doctors Registered" value={metricValue(dashboardData, 'doctors', 142)} note="Clinical staff directory" />
        <MetricCard icon="⛓️" tone="red" label="Chain Synced" value={chainSyncedValue(dashboardData)} note="Records with synced blockchain metadata" />
      </div>
      ) : null}

      {showAlerts ? (
      <div className="mt2">
        <Alert tone="danger">🔴 <strong>Critical:</strong> ICU at 95% capacity - 2 beds remaining. Overflow protocol may be needed.</Alert>
        <Alert tone="warning">⚠️ <strong>Staffing:</strong> Night shift short by 3 nurses in Ward B. Please reassign from Ward D.</Alert>
        <Alert tone="info">ℹ️ <strong>Audit:</strong> Monthly compliance report due by June 30. 4 departments pending sign-off.</Alert>
      </div>
      ) : null}

      {showBeds ? (
      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">🏢 Department Occupancy</div>
          <div className="card-sub">Real-time ward utilisation</div>
          <div className="mt1">
            <ProgressBar label="ICU" value="95%" percent={95} gradient="linear-gradient(90deg,var(--red),var(--amber))" />
            <ProgressBar label="Cardiology" value="82%" percent={82} gradient="linear-gradient(90deg,var(--amber),var(--green))" />
            <ProgressBar label="Orthopaedics" value="67%" percent={67} gradient="linear-gradient(90deg,var(--cyan),var(--purple))" />
            <ProgressBar label="Paediatrics" value="54%" percent={54} gradient="linear-gradient(90deg,var(--green),var(--cyan))" />
          </div>
        </div>

        <div className="card">
          <div className="card-title">💰 Revenue Overview</div>
          <div className="card-sub">Monthly financial snapshot</div>
          <div className="chart-box mt1">
            <div className="bar" style={{ height: '70%' }} />
            <div className="bar" style={{ height: '55%' }} />
            <div className="bar" style={{ height: '80%' }} />
            <div className="bar" style={{ height: '60%' }} />
            <div className="bar" style={{ height: '75%' }} />
            <div className="bar" style={{ height: '90%' }} />
          </div>
          <div className="metric-summary">
            <div>
              <div className="metric-summary-label">TOTAL REVENUE</div>
              <div className="metric-summary-value metric-summary-green">₹36.5M</div>
            </div>
            <div>
              <div className="metric-summary-label">TOTAL EXPENSES</div>
              <div className="metric-summary-value metric-summary-amber">₹22.1M</div>
            </div>
          </div>
        </div>
      </div>
      ) : null}

      {showStaff ? (
      <div className="card mt3">
        <div className="card-title">👩‍⚕️ Staff Overview</div>
        <div className="card-sub">Current duty rosters and performance</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.role}</td>
                  <td>{row.department}</td>
                  <td>{row.shift}</td>
                  <td>{row.status}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : null}

      {showStaff ? (
      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">🩺 Register Doctor</div>
          <div className="card-sub">Create a doctor account and map it to a department for patient booking.</div>
          {doctorMessage ? <Alert tone="success">{doctorMessage}</Alert> : null}
          {doctorError ? <Alert tone="danger">{doctorError}</Alert> : null}
          <form className="portal-form" onSubmit={handleDoctorSubmit}>
            <label>
              Full Name
              <input type="text" value={doctorForm.fullName} onChange={handleDoctorFormChange('fullName')} placeholder="Dr. Name" required />
            </label>
            <label>
              Email
              <input type="email" value={doctorForm.email} onChange={handleDoctorFormChange('email')} placeholder="doctor@hospital.com" required />
            </label>
            <label>
              Password
              <input type="password" value={doctorForm.password} onChange={handleDoctorFormChange('password')} placeholder="Create a secure password" required />
            </label>
            <label>
              Department
              <select value={doctorForm.department} onChange={handleDoctorFormChange('department')} required>
                <option value="">Select department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Specialization
              <input type="text" value={doctorForm.specialization} onChange={handleDoctorFormChange('specialization')} placeholder="Cardiologist, Surgeon..." />
            </label>
            <label>
              License Number
              <input type="text" value={doctorForm.licenseNumber} onChange={handleDoctorFormChange('licenseNumber')} placeholder="Medical council ID" />
            </label>
            <label className="portal-span-2">
              Phone
              <input type="text" value={doctorForm.phone} onChange={handleDoctorFormChange('phone')} placeholder="+91..." />
            </label>
            <div className="portal-actions portal-span-2">
              <Button type="submit" disabled={doctorSubmitting}>
                {doctorSubmitting ? 'Creating...' : 'Create Doctor Account'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setDoctorForm(emptyDoctorForm)}>
                Clear
              </Button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title">🏷️ Department Mapping</div>
          <div className="card-sub">Doctors registered here will appear in the patient appointment dropdown by department.</div>
          {registeredDoctors.length ? (
            registeredDoctors.slice(0, 6).map((doctor) => (
              <ItemRow
                key={doctor.id}
                title={`${doctor.department} · ${doctor.name}`}
                subtitle={`${doctor.specialization}${doctor.licenseNumber ? ` · ${doctor.licenseNumber}` : ''}`}
                right={<Badge tone="info">{doctor.department}</Badge>}
              />
            ))
          ) : (
            <Alert tone="info">No doctor accounts registered yet.</Alert>
          )}
        </div>
      </div>
      ) : null}

      {showCompliance ? (
      <div className="grid-3 mt3">
        <div className="card">
          <div className="card-title">📋 Compliance Status</div>
          <div className="card-sub">Regulatory & accreditation checks</div>
          <ItemRow title="NABH Accreditation" subtitle="Expires Dec 2026" right={<Badge tone="success">Valid</Badge>} />
          <ItemRow title="Fire Safety Audit" subtitle="July 10, 2026" right={<Badge tone="warning">Due soon</Badge>} />
          <ItemRow title="Monthly Report" subtitle="4 departments pending" right={<Badge tone="danger">Pending</Badge>} />
        </div>
        <div className="card">
          <div className="card-title">🔧 Maintenance Requests</div>
          <div className="card-sub">Facility & equipment issues</div>
          <ItemRow title="MRI Machine - Ward C" subtitle="Calibration required today" right={<Badge tone="danger">Critical</Badge>} />
          <ItemRow title="AC Unit - Room 204" subtitle="Reported June 22" right={<Badge tone="warning">Medium</Badge>} />
          <ItemRow title="Generator Test" subtitle="June 25, 11 AM" right={<Badge tone="success">Scheduled</Badge>} />
        </div>
        <div className="card">
          <div className="card-title">📊 Key Metrics</div>
          <div className="card-sub">This month at a glance</div>
          <div className="metric-list">
            <div><span>Patient Satisfaction</span><strong className="metric-summary-green">4.6 / 5</strong></div>
            <div><span>Avg Wait Time</span><strong className="metric-summary-cyan">18 min</strong></div>
            <div><span>Readmission Rate</span><strong className="metric-summary-amber">3.2%</strong></div>
            <div><span>Mortality Rate</span><strong className="metric-summary-green">0.8%</strong></div>
            <div><span>Net Profit Margin</span><strong className="metric-summary-cyan">39.4%</strong></div>
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
