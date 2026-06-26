import Tabs from '@/components/ui/Tabs';
import ModuleCard from './ModuleCard';
import './PatientPortal.css';

const concerns = ['High Blood Pressure', 'Lifestyle Related Risk'];
const recommendations = [
  'Regular exercise 30 mins/day',
  'Reduce salt intake',
  'Schedule BP check-up',
];

export default function PatientPortal() {
  return (
    <ModuleCard number={2} title="AI in Patient Portal" badge="Health AI" badgeType="ai">
      <div className="welcome-text">Welcome back, Shiv 👋</div>
      <Tabs tabs={['Overview', 'AI Health Insights', 'Predictions']} defaultActive={1} />
      <div className="insights-label">AI Health Insights</div>
      <div className="risk-score-block">
        <div className="risk-circle">
          <svg width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
            <circle cx="35" cy="35" r="28" fill="none" stroke="var(--navy-border)" strokeWidth="6" />
            <circle
              cx="35"
              cy="35"
              r="28"
              fill="none"
              stroke="var(--green)"
              strokeWidth="6"
              strokeDasharray="176"
              strokeDashoffset="120"
              strokeLinecap="round"
            />
          </svg>
          <div className="risk-circle-label">
            <div className="risk-pct">32%</div>
            <div className="risk-level">LOW</div>
          </div>
        </div>
        <div className="risk-details">
          <div className="risk-detail-title">Possible Concerns</div>
          <ul className="risk-detail-list">
            {concerns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="health-score-row">
        <div>
          <div className="health-score-label">Health Score History</div>
          <div className="health-score-sub">+5% vs last month</div>
        </div>
        <div className="health-score-right">
          <div className="health-score-val">82</div>
          <div className="health-score-sub">Good</div>
        </div>
      </div>
      <div className="recommendations-box">
        <div className="rec-label">AI Recommendations</div>
        <ul className="rec-list">
          {recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </ModuleCard>
  );
}
