import ModuleCard from './ModuleCard';
import './EmergencyModule.css';

const alerts = [
  { id: 'P1004', name: 'Ramesh', condition: 'Cardiac Arrest Risk', risk: 'HIGH' as const },
  { id: 'P1009', name: 'Anita', condition: 'Sepsis Risk', risk: 'MEDIUM' as const },
  { id: 'P1012', name: 'Vikas', condition: 'Stroke Risk', risk: 'HIGH' as const },
  { id: 'P1015', name: 'Neha', condition: 'Respiratory Risk', risk: 'LOW' as const },
];

const riskClassMap = {
  HIGH: 'risk-high',
  MEDIUM: 'risk-medium',
  LOW: 'risk-low',
};

export default function EmergencyModule() {
  return (
    <ModuleCard number={4} title="AI Emergency Command Center" badge="● Live" badgeType="live">
      <div className="alerts-label">AI Risk Alerts</div>
      <div className="alert-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div>
              <div className="alert-patient">
                {alert.id} ({alert.name})
              </div>
              <div className="alert-condition">{alert.condition}</div>
            </div>
            <span className={`risk-badge ${riskClassMap[alert.risk]}`}>{alert.risk}</span>
          </div>
        ))}
      </div>
      <div className="prediction-box">
        <div className="pred-label">AI Predictions — Risk of Deterioration (Next 6h)</div>
        <div className="pred-pct">76%</div>
        <div className="pred-desc">High Risk — Patient condition may worsen.</div>
        <div className="pred-action">
          → Increase monitoring · Prepare ICU · Notify cardiologist
        </div>
      </div>
      <button type="button" className="btn-sm btn-purple emergency-action">
        🚨 Take Action
      </button>
    </ModuleCard>
  );
}
