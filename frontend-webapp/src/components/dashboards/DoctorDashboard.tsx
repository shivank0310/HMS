import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ItemRow from '@/components/ui/ItemRow';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';

const patientRows = [
  {
    name: 'John Doe',
    condition: 'Hypertension',
    medication: 'Lisinopril 10mg',
    status: <Badge tone="success">✓ Validated</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    name: 'Sarah Johnson',
    condition: 'Arrhythmia',
    medication: 'Metoprolol 50mg',
    status: <Badge tone="warning">⚠ Review</Badge>,
    action: <Button variant="primary" size="sm">Review</Button>,
  },
  {
    name: 'Mike Wilson',
    condition: 'Diabetes Type 2',
    medication: 'Metformin 500mg',
    status: <Badge tone="success">✓ Validated</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    name: 'Priya Mehta',
    condition: 'Thyroid',
    medication: 'Levothyroxine 50mcg',
    status: <Badge tone="info">Pending Lab</Badge>,
    action: <Button variant="secondary" size="sm">Hold</Button>,
  },
];

export default function DoctorDashboard() {
  return (
    <>
      <div className="grid-4">
        <MetricCard icon="👥" tone="cyan" label="Today's Patients" value="12" note="3 pending review" />
        <MetricCard icon="✅" tone="green" label="Completed Consults" value="8" note="Avg 28 min each" />
        <MetricCard icon="⚠️" tone="red" label="High Risk Alerts" value="2" note="Immediate action needed" />
        <MetricCard icon="💊" tone="purple" label="Prescriptions Today" value="15" note="All AI-validated" />
      </div>

      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">🤖 AI Diagnosis Insights</div>
          <div className="card-sub">Real-time treatment recommendations</div>

          <ItemRow
            accent="var(--cyan)"
            title="John Doe (P001) - Hypertension Stage 2"
            subtitle="Recommended: BP monitoring · Lisinopril review"
            right={<Badge tone="success">92% confidence</Badge>}
          />
          <ItemRow
            accent="var(--amber)"
            title="Sarah Johnson (P003) - Drug Interaction"
            subtitle="⚠ Warfarin ↔ Aspirin conflict detected"
            right={<Badge tone="warning">Review needed</Badge>}
          />
          <ItemRow
            accent="var(--red)"
            title="Amit Sharma (P007) - Arrhythmia Risk"
            subtitle="ECG anomaly detected · Cardiologist escalation advised"
            right={<Badge tone="danger">High Risk</Badge>}
          />

          <Button block>View All AI Insights</Button>
        </div>

        <div className="card">
          <div className="card-title">📋 Today's Queue</div>
          <div className="card-sub">Prioritised by AI risk score</div>

          <ItemRow title="John Doe (P001)" subtitle="10:15 AM · Chest Pain · Room 3" right={<Badge tone="danger">HIGH RISK</Badge>} />
          <ItemRow title="Sarah Johnson (P003)" subtitle="10:45 AM · Follow-up · Room 5" right={<Badge tone="warning">MEDIUM</Badge>} />
          <ItemRow title="Mike Wilson (P002)" subtitle="11:00 AM · Regular Check-up · Room 2" right={<Badge tone="success">LOW RISK</Badge>} />
          <ItemRow title="Priya Mehta (P011)" subtitle="11:30 AM · Diabetes Review · Room 5" right={<Badge tone="info">SCHEDULED</Badge>} />
        </div>
      </div>

      <div className="card mt3">
        <div className="card-title">💊 Active Treatment Plans</div>
        <div className="card-sub">AI-validated prescriptions</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Condition</th>
                <th>Medication</th>
                <th>AI Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patientRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.condition}</td>
                  <td>{row.medication}</td>
                  <td>{row.status}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">📊 Weekly Patient Volume</div>
          <div className="card-sub">Mon-Sat consultations</div>
          <div className="chart-box mt1">
            <div className="bar" style={{ height: '40%' }} />
            <div className="bar" style={{ height: '65%' }} />
            <div className="bar" style={{ height: '55%' }} />
            <div className="bar" style={{ height: '80%' }} />
            <div className="bar" style={{ height: '70%' }} />
            <div className="bar" style={{ height: '85%' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">📈 AI Model Accuracy</div>
          <div className="card-sub">Diagnosis validation rates</div>
          <div className="mt1">
            <ProgressBar label="Diagnostic Accuracy" value="92%" percent={92} gradient="linear-gradient(90deg,var(--cyan),var(--purple))" />
            <ProgressBar label="Drug Interaction Detection" value="98%" percent={98} gradient="linear-gradient(90deg,var(--green),var(--cyan))" />
            <ProgressBar label="Treatment Success Rate" value="84%" percent={84} gradient="linear-gradient(90deg,var(--amber),var(--green))" />
          </div>
        </div>
      </div>
    </>
  );
}
