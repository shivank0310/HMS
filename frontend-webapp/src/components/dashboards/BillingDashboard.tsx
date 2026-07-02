import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MetricCard from '@/components/ui/MetricCard';
import BlockchainStatus from '@/components/dashboards/BlockchainStatus';
import { chainSyncedValue, metricValue } from '@/components/dashboards/dashboardMetrics';
import type { DashboardComponentProps } from '@/types';
import './BillingDashboard.css';

const billingRows = [
  {
    invoice: 'INV-5850',
    patient: 'John Doe',
    amount: '₹45,000',
    status: <Badge tone="success">Paid</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
  {
    invoice: 'INV-5849',
    patient: 'Sarah Johnson',
    amount: '₹28,500',
    status: <Badge tone="info">Pending</Badge>,
    action: <Button variant="primary" size="sm">Remind</Button>,
  },
  {
    invoice: 'INV-5848',
    patient: 'Mike Wilson',
    amount: '₹62,000',
    status: <Badge tone="warning">Partial</Badge>,
    action: <Button variant="secondary" size="sm">View</Button>,
  },
];

export default function BillingDashboard({ activeMenu, dashboardData, isLoading, error }: DashboardComponentProps) {
  const isOverview = activeMenu === 'Overview';
  const showMetrics = isOverview || activeMenu === 'Reports';
  const showAlerts = isOverview || activeMenu === 'Inventory' || activeMenu === 'Patient Billing' || activeMenu === 'Cost Optimisation';
  const showInventory = isOverview || activeMenu === 'Inventory';
  const showBilling = isOverview || activeMenu === 'Patient Billing';
  const showCost = isOverview || activeMenu === 'Cost Optimisation';
  const showReports = isOverview || activeMenu === 'Reports';

  return (
    <div className="dashboard-tab billing-dashboard">
      <div className="tab-heading">
        <span>{activeMenu}</span>
      </div>
      <BlockchainStatus data={dashboardData} isLoading={isLoading} error={error} />
      {showMetrics ? (
      <div className="grid-4">
        <MetricCard icon="📦" tone="cyan" label="Total Medicines" value={metricValue(dashboardData, 'inventory', '1,842')} note="Inventory API records" />
        <MetricCard icon="💊" tone="green" label="Dispenses" value={metricValue(dashboardData, 'dispenses', 120)} note="Synced through pharmacycc" />
        <MetricCard icon="⚠️" tone="amber" label="Expiring Soon" value={metricValue(dashboardData, 'expiringSoon', 8)} note="Within 30 days" />
        <MetricCard icon="⛓️" tone="purple" label="Chain Synced" value={chainSyncedValue(dashboardData)} note="Pharmacy and billing ledger records" />
      </div>
      ) : null}

      {showAlerts ? (
      <div className="mt2">
        <Alert tone="danger">🔴 <strong>Critical:</strong> INV-2026-5847 expired. Auto follow-up initiated.</Alert>
        <Alert tone="warning">⚠️ <strong>Approval:</strong> 5 invoices pending admin sign-off.</Alert>
        <Alert tone="info">ℹ️ <strong>AI Tip:</strong> Generic substitution could save ₹85K this month.</Alert>
      </div>
      ) : null}

      {(showInventory || showBilling) ? (
      <div className="grid-2 mt3">
        {showInventory ? (
        <div className="card">
          <div className="card-title">📦 Medicine Inventory</div>
          <div className="card-sub">Current stock with AI reorder predictions</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>In Stock</th>
                  <th>Status</th>
                  <th>Reorder</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paracetamol 500mg</td>
                  <td>850 units</td>
                  <td><Badge tone="success">✓ Optimal</Badge></td>
                  <td className="table-note-green">50 days</td>
                </tr>
                <tr>
                  <td>Amoxicillin 250mg</td>
                  <td>120 units</td>
                  <td><Badge tone="warning">⚠ Low Stock</Badge></td>
                  <td className="table-note-amber">Urgent</td>
                </tr>
                <tr>
                  <td>Omeprazole 20mg</td>
                  <td>450 units</td>
                  <td><Badge tone="success">✓ Optimal</Badge></td>
                  <td className="table-note-green">35 days</td>
                </tr>
                <tr>
                  <td>Metformin 500mg</td>
                  <td>45 units</td>
                  <td><Badge tone="danger">🔴 Critical</Badge></td>
                  <td className="table-note-red">3 days!</td>
                </tr>
                <tr>
                  <td>Atorvastatin 20mg</td>
                  <td>320 units</td>
                  <td><Badge tone="success">✓ Optimal</Badge></td>
                  <td className="table-note-green">28 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        ) : null}

        {showBilling ? (
        <div className="card">
          <div className="card-title">💳 Patient Billing Records</div>
          <div className="card-sub">Today's invoices and payment status</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              {billingRows.map((row) => (
                <tr key={row.invoice}>
                  <td>{row.invoice}</td>
                  <td>{row.patient}</td>
                  <td>{row.amount}</td>
                  <td>{row.status}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
        ) : null}
      </div>
      ) : null}

      {(showCost || showReports) ? (
      <div className="grid-2 mt3">
        {showCost ? (
        <div className="card">
          <div className="card-title">💡 AI Cost Optimisation</div>
          <div className="card-sub">Savings recommendations</div>
            <div className="cost-list">
              <div className="cost-card cost-green">
                <div className="cost-head">
                  <span>Generic Substitution</span>
                <strong>Save ₹42K/mo</strong>
              </div>
              <p>Replace branded drugs with approved generics</p>
            </div>
            <div className="cost-card cost-cyan">
              <div className="cost-head">
                <span>Bulk Ordering</span>
                <strong>Save ₹28K/mo</strong>
              </div>
              <p>Consolidate suppliers for better rates</p>
            </div>
            <div className="cost-card cost-amber">
              <div className="cost-head">
                <span>Reduce Waste</span>
                <strong>Save ₹15K/mo</strong>
              </div>
              <p>Minimise expiry losses via better forecasting</p>
              </div>
            </div>
            <Button block>View All Recommendations</Button>
          </div>
        ) : null}

        {showReports ? (
        <div className="card">
          <div className="card-title">📊 Monthly Financial Summary</div>
          <div className="card-sub">Revenue, costs, and profit</div>
          <div className="chart-box mt1">
            <div className="bar" style={{ height: '75%' }} />
            <div className="bar" style={{ height: '60%' }} />
            <div className="bar" style={{ height: '80%' }} />
            <div className="bar" style={{ height: '55%' }} />
            <div className="bar" style={{ height: '85%' }} />
            <div className="bar" style={{ height: '70%' }} />
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
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
