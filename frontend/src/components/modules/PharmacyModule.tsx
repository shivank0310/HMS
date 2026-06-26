import ModuleCard from './ModuleCard';
import './PharmacyModule.css';

export default function PharmacyModule() {
  return (
    <ModuleCard number={5} title="AI in Pharmacy Dashboard" badge="Drug AI" badgeType="ai">
      <div className="drug-check-box">
        <div className="drug-check-label">⚠️ AI Drug Interaction Checker</div>
        <div className="drug-patient-info">
          Patient: John Doe — Prescribed: Drug A (Paracetamol) + Drug B (Warfarin)
        </div>
        <div className="drug-interaction-result">⚠ Moderate Interaction Found</div>
        <div className="drug-rec">
          Warfarin effectiveness may decrease.{' '}
          <strong>Monitor INR levels regularly.</strong>
        </div>
      </div>
      <div className="stock-forecast">
        <div className="forecast-label">📈 AI Inventory Prediction — Insulin Stock</div>
        <div className="forecast-chart-wrap">
          <svg width="100%" height="60" viewBox="0 0 280 60" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points="0,10 40,15 80,12 120,20 160,30 200,45 240,50 280,58"
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polyline
              points="0,10 40,12 80,10 120,15 160,22 200,35 240,40 280,45"
              fill="none"
              stroke="var(--purple)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <line x1="0" y1="58" x2="280" y2="58" stroke="var(--navy-border)" strokeWidth="1" />
          </svg>
          <div className="forecast-legend">
            <div className="legend-item">
              <div className="legend-line legend-line--cyan" />
              Current Stock
            </div>
            <div className="legend-item">
              <div className="legend-line legend-line--purple" />
              Predicted
            </div>
          </div>
        </div>
        <div className="forecast-suggestion">
          💡 AI Suggestion: Increase Insulin stock by 20% in next 7 days
        </div>
      </div>
      <button type="button" className="btn-sm btn-cyan pharmacy-action">
        📦 Create Purchase Order
      </button>
    </ModuleCard>
  );
}
