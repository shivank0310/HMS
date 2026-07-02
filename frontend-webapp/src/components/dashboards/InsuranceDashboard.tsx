import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MetricCard from '@/components/ui/MetricCard';
import ProgressBar from '@/components/ui/ProgressBar';
import BlockchainStatus from '@/components/dashboards/BlockchainStatus';
import { metricValue } from '@/components/dashboards/dashboardMetrics';
import type { DashboardComponentProps } from '@/types';
import './InsuranceDashboard.css';

const claimRows = [
  {
    claimId: 'CLM-2026-0897',
    patient: 'John Doe',
    amount: '₹45,000',
    insurer: 'Star Health',
    score: <Badge tone="success">Low (2%)</Badge>,
    status: <Badge tone="success">Approved</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    claimId: 'CLM-2026-0895',
    patient: 'Sarah Johnson',
    amount: '₹1,20,000',
    insurer: 'HDFC ERGO',
    score: <Badge tone="warning">Medium (28%)</Badge>,
    status: <Badge tone="warning">Under Review</Badge>,
    action: <Button variant="primary" size="sm">Review</Button>,
  },
  {
    claimId: 'CLM-2026-0892',
    patient: 'Ramesh Gupta',
    amount: '₹3,50,000',
    insurer: 'LIC Health',
    score: <Badge tone="danger">High (78%)</Badge>,
    status: <Badge tone="danger">Flagged</Badge>,
    action: <Button variant="primary" size="sm">Investigate</Button>,
  },
  {
    claimId: 'CLM-2026-0889',
    patient: 'Priya Mehta',
    amount: '₹22,500',
    insurer: 'Bajaj Allianz',
    score: <Badge tone="success">Low (5%)</Badge>,
    status: <Badge tone="success">Approved</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    claimId: 'CLM-2026-0885',
    patient: 'Anil Sharma',
    amount: '₹68,000',
    insurer: 'New India Assurance',
    score: <Badge tone="info">Pending</Badge>,
    status: <Badge tone="info">Pre-auth</Badge>,
    action: <Button variant="secondary" size="sm">Chase</Button>,
  },
];

export default function InsuranceDashboard({ activeMenu, dashboardData, isLoading, error }: DashboardComponentProps) {
  const isOverview = activeMenu === 'Claims Overview';
  const showMetrics = isOverview || activeMenu === 'Analytics';
  const showAlerts = isOverview || activeMenu === 'Fraud Detection' || activeMenu === 'Pre-Authorisations';
  const showClaims = isOverview || activeMenu === 'Active Claims' || activeMenu === 'Pre-Authorisations';
  const showAnalytics = isOverview || activeMenu === 'Fraud Detection' || activeMenu === 'Analytics';

  return (
    <div className="dashboard-tab insurance-dashboard">
      <div className="tab-heading">
        <span>{activeMenu}</span>
      </div>
      <BlockchainStatus data={dashboardData} isLoading={isLoading} error={error} />
      {showMetrics ? (
      <div className="grid-4">
        <MetricCard icon="📝" tone="cyan" label="Claims" value={metricValue(dashboardData, 'claims', 147)} note="Claims API records" />
        <MetricCard icon="✅" tone="green" label="Approved Claims" value={metricValue(dashboardData, 'approvedClaims', 98)} note="Ready for settlement" />
        <MetricCard icon="⏳" tone="amber" label="Under Review" value={metricValue(dashboardData, 'pendingClaims', 31)} note="Submitted or review state" />
        <MetricCard icon="🧾" tone="red" label="Pending Bills" value={metricValue(dashboardData, 'pendingBills', 18)} note="Billing ledger relation" />
      </div>
      ) : null}

      {showAlerts ? (
      <div className="mt2">
        <Alert tone="warning">⚠️ <strong>Fraud Alert:</strong> AI flagged Claim CLM-2026-0892 for unusual billing pattern. Manual review required.</Alert>
        <Alert tone="info">ℹ️ <strong>Pre-auth:</strong> 5 pre-authorisation requests awaiting insurer response (TPA: Star Health, HDFC ERGO).</Alert>
      </div>
      ) : null}

      {showClaims ? (
      <div className="card mt3">
        <div className="card-title">📋 Recent Claims</div>
        <div className="card-sub">AI-processed with fraud detection scores</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Insurer</th>
                <th>AI Fraud Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {claimRows.map((row) => (
                <tr key={row.claimId}>
                  <td>{row.claimId}</td>
                  <td>{row.patient}</td>
                  <td>{row.amount}</td>
                  <td>{row.insurer}</td>
                  <td>{row.score}</td>
                  <td>{row.status}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : null}

      {showAnalytics ? (
      <div className="grid-2 mt3">
        <div className="card">
          <div className="card-title">🏦 Payer Breakdown</div>
          <div className="card-sub">Claims by insurance provider</div>
          <div className="mt1">
            <ProgressBar label="Star Health" value="38%" percent={38} gradient="linear-gradient(90deg,var(--cyan),var(--purple))" />
            <ProgressBar label="HDFC ERGO" value="24%" percent={24} gradient="linear-gradient(90deg,var(--green),var(--cyan))" />
            <ProgressBar label="Bajaj Allianz" value="18%" percent={18} gradient="linear-gradient(90deg,var(--amber),var(--green))" />
            <ProgressBar label="Others" value="20%" percent={20} gradient="linear-gradient(90deg,var(--muted),var(--navy-border))" />
          </div>
        </div>

        <div className="card">
          <div className="card-title">🤖 AI Fraud Detection</div>
          <div className="card-sub">Monthly anomaly report</div>
          <div className="fraud-grid">
            <div className="fraud-pill fraud-danger">
              <span>High-Risk Flags</span>
              <strong>6 claims</strong>
            </div>
            <div className="fraud-pill fraud-warning">
              <span>Medium Anomalies</span>
              <strong>14 claims</strong>
            </div>
            <div className="fraud-pill fraud-success">
              <span>Clean Submissions</span>
              <strong>127 claims</strong>
            </div>
            <div className="fraud-pill fraud-info">
              <span>Estimated Fraud Saved</span>
              <strong>₹4.2M</strong>
            </div>
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
