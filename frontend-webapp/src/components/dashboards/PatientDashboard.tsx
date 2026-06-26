import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ItemRow from '@/components/ui/ItemRow';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';

const medicationRows = [
  {
    medication: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily (morning)',
    refills: '2 remaining',
    status: <Badge tone="success">Active</Badge>,
  },
  {
    medication: 'Atorvastatin',
    dosage: '20 mg',
    frequency: 'Once daily (night)',
    refills: '1 remaining',
    status: <Badge tone="info">Active</Badge>,
  },
  {
    medication: 'Aspirin',
    dosage: '100 mg',
    frequency: 'Once daily (morning)',
    refills: '3 remaining',
    status: <Badge tone="success">Active</Badge>,
  },
];

export default function PatientDashboard() {
  return (
    <>
      <div className="grid-4">
        <MetricCard icon="❤️" tone="cyan" label="Heart Rate" value="78" note="bpm · Normal" />
        <MetricCard icon="🩺" tone="green" label="Blood Pressure" value="118/76" note="Optimal range" />
        <MetricCard icon="📅" tone="amber" label="Next Appointment" value="Jun 24" note="Dr. Rajesh Kumar" />
        <MetricCard icon="💊" tone="purple" label="Active Medications" value="3" note="All on schedule" />
      </div>

      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">📈 Vitals This Month</div>
          <div className="card-sub">Blood pressure & heart rate trend</div>
          <div className="chart-box mt1">
            <div className="bar" style={{ height: '55%' }} />
            <div className="bar" style={{ height: '60%' }} />
            <div className="bar" style={{ height: '50%' }} />
            <div className="bar" style={{ height: '65%' }} />
            <div className="bar" style={{ height: '58%' }} />
            <div className="bar" style={{ height: '62%' }} />
          </div>
          <div className="mini-stats">
            <div>
              <div className="mini-stat-value mini-stat-cyan">↑ 5%</div>
              <div className="mini-stat-label">Improvement</div>
            </div>
            <div>
              <div className="mini-stat-value mini-stat-green">✓ On Track</div>
              <div className="mini-stat-label">Health Goals</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📅 Upcoming Appointments</div>
          <div className="card-sub">Scheduled visits</div>
          <ItemRow
            title="Dr. Rajesh Kumar - Cardiology"
            subtitle="June 24 · 10:30 AM · OPD Block B"
            right={<Badge tone="success">Confirmed</Badge>}
          />
          <ItemRow
            title="Lab Work - Blood Tests"
            subtitle="June 25 · 2:00 PM · Pathology Lab"
            right={<Badge tone="info">Scheduled</Badge>}
          />
          <ItemRow
            title="ECG Follow-up"
            subtitle="June 28 · Time TBD"
            right={<Badge tone="warning">Pending confirm</Badge>}
          />
          <Button block>Book New Appointment</Button>
        </div>
      </div>

      <div className="card mt3">
        <div className="card-title">💊 Current Medications</div>
        <div className="card-sub">Active prescriptions with dosage schedule</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Refills Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medicationRows.map((row) => (
                <tr key={row.medication}>
                  <td>{row.medication}</td>
                  <td>{row.dosage}</td>
                  <td>{row.frequency}</td>
                  <td>{row.refills}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">📄 Medical Records</div>
          <div className="card-sub">Your health documents</div>
          <ItemRow title="📋 Lab Report - June 15" subtitle="Blood Test Results · PDF" right={<Button variant="secondary" size="sm">Download</Button>} />
          <ItemRow title="📊 Prescription History" subtitle="All past medications" right={<Button variant="secondary" size="sm">View</Button>} />
          <ItemRow title="🫀 ECG Report - June 1" subtitle="Cardiology · PDF" right={<Button variant="secondary" size="sm">Download</Button>} />
        </div>

        <div className="card">
          <div className="card-title">🎯 Health Goals</div>
          <div className="card-sub">Your wellness progress</div>
          <div className="mt1">
            <ProgressBar label="Weight Loss Goal" value="68%" percent={68} gradient="linear-gradient(90deg,var(--green),var(--cyan))" />
            <ProgressBar label="Exercise Routine" value="45%" percent={45} gradient="linear-gradient(90deg,var(--cyan),var(--purple))" />
            <ProgressBar label="Sleep Schedule" value="82%" percent={82} gradient="linear-gradient(90deg,var(--amber),var(--green))" />
            <ProgressBar label="Medication Adherence" value="95%" percent={95} gradient="linear-gradient(90deg,var(--purple),var(--cyan))" />
          </div>
        </div>
      </div>
    </>
  );
}
