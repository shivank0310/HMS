import ModuleCard from './ModuleCard';
import './BillingModule.css';

const invoiceLines = [
  { label: 'Consultation Fee', amount: '₹1,500' },
  { label: 'Medicine Charges', amount: '₹3,500' },
  { label: 'Diagnostic Charges', amount: '₹2,500' },
];

const analysisItems = ['No duplicate claims', 'Patient verified', 'Treatment pattern normal'];

export default function BillingModule() {
  return (
    <ModuleCard number={3} title="AI in Billing & Insurance" badge="Fraud AI" badgeType="ai">
      <div className="invoice-id">Invoice #INV-1024</div>
      <table className="invoice-table">
        <tbody>
          {invoiceLines.map((line) => (
            <tr key={line.label}>
              <td>{line.label}</td>
              <td>{line.amount}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>Total Amount</td>
            <td>₹7,500</td>
          </tr>
        </tbody>
      </table>
      <div className="fraud-score-box">
        <div className="fraud-label">AI Claim Analysis — Fraud Risk Score</div>
        <div className="fraud-pct">
          18% <span className="fraud-risk-label">Low Risk</span>
        </div>
        <ul className="analysis-list">
          {analysisItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="billing-actions">
        <button type="button" className="btn-sm btn-green billing-btn">
          ✓ Approve Claim
        </button>
        <button type="button" className="btn-sm btn-outline-sm">
          🔗 Save to Blockchain
        </button>
      </div>
      <div className="cost-optimization">
        <div className="cost-optimization-label">AI Cost Optimization</div>
        <div className="cost-optimization-text">
          Save up to <strong>₹850</strong> with generic medicine substitution & optimized lab tests.
        </div>
      </div>
    </ModuleCard>
  );
}
