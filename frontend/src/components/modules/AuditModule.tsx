import ModuleCard from './ModuleCard';
import './AuditModule.css';

const monitoringItems = [
  { key: 'Data Integrity', status: 'Good' },
  { key: 'Access Control', status: 'Good' },
  { key: 'Policy Adherence', status: 'Good' },
];

export default function AuditModule() {
  return (
    <ModuleCard number={6} title="AI in Audit & Compliance" badge="● Monitoring" badgeType="live">
      <div className="anomaly-alert">
        <div className="anomaly-label">🔍 AI Anomaly Detection — Suspicious Access</div>
        <div className="anomaly-user">User: Doctor_007</div>
        <div className="anomaly-desc">
          Accessed 23 patient records in 5 mins — unusual pattern detected.
        </div>
      </div>
      <div className="compliance-row">
        <div>
          <div className="compliance-label-top">AI Compliance Score</div>
          <div className="compliance-score-big">
            98 <span className="compliance-out-of">/100</span>
          </div>
          <div className="compliance-label">Excellent</div>
        </div>
        <div className="compliance-details">
          <div className="compliance-bar-wrap">
            <div className="compliance-bar-fill" />
          </div>
          <div className="monitoring-list">
            {monitoringItems.map((item) => (
              <div key={item.key} className="monitoring-item">
                <span className="monitoring-key">{item.key}</span>
                <span className="status-good">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button type="button" className="btn-sm btn-purple audit-action">
        🔍 Investigate Anomaly
      </button>
    </ModuleCard>
  );
}
