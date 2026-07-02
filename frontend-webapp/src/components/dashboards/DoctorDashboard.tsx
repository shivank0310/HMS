import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ItemRow from '@/components/ui/ItemRow';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import BlockchainStatus from '@/components/dashboards/BlockchainStatus';
import { chainSyncedValue, metricValue } from '@/components/dashboards/dashboardMetrics';
import type { DashboardComponentProps } from '@/types';
import './DoctorDashboard.css';

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

export default function DoctorDashboard({ activeMenu, dashboardData, isLoading, error }: DashboardComponentProps) {
  const isOverview = activeMenu === 'Overview';
  const showMetrics = isOverview || activeMenu === 'My Patients' || activeMenu === 'Performance';
  const showClinicalPanels = isOverview || activeMenu === 'My Patients' || activeMenu === 'AI Insights';
  const showPrescriptions = isOverview || activeMenu === 'Prescriptions';
  const showPerformance = isOverview || activeMenu === 'AI Insights' || activeMenu === 'Performance';

  return (
    <div className="dashboard-tab doctor-dashboard">
      <div className="tab-heading">
        <span>{activeMenu}</span>
      </div>
      <BlockchainStatus data={dashboardData} isLoading={isLoading} error={error} />
      {showMetrics ? (
      <div className="grid-4">
        <MetricCard icon="👥" tone="cyan" label="Patients" value={metricValue(dashboardData, 'patients', 12)} note="From patient records API" />
        <MetricCard icon="✅" tone="green" label="Active Treatments" value={metricValue(dashboardData, 'activeTreatments', 8)} note="Synced through treatmentcc" />
        <MetricCard icon="⚠️" tone="red" label="High Risk Alerts" value={metricValue(dashboardData, 'highRiskAlerts', 2)} note="Emergency access records" />
        <MetricCard icon="⛓️" tone="purple" label="Chain Synced" value={chainSyncedValue(dashboardData)} note="Patient/treatment/pharmacy ledger writes" />
      </div>
      ) : null}

      {showClinicalPanels ? (
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
      ) : null}

      {showPrescriptions ? (
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
      ) : null}

      {showPerformance ? (
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
      ) : null}
    </div>
  );
}
