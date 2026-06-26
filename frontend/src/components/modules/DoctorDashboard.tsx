import Tabs from '@/components/ui/Tabs';
import ModuleCard from './ModuleCard';
import './DoctorDashboard.css';

const diagnoses = [
  { name: '1. Viral Fever', confidence: 92, color: 'var(--cyan)' },
  { name: '2. Influenza', confidence: 78, color: 'var(--amber)' },
  { name: '3. Dengue', confidence: 65, color: 'var(--muted)' },
];

export default function DoctorDashboard() {
  return (
    <ModuleCard
      number={1}
      title="AI in Doctor Treatment Dashboard"
      badge="AI Assist"
      badgeType="ai"
    >
      <Tabs tabs={['Treatment', 'Prescriptions', 'Reports']} defaultActive={0} />
      <div className="patient-info">
        <div className="patient-name">Patient: John Doe</div>
        <div className="patient-id">P001 · Admitted: Jun 18 2026</div>
      </div>
      <div className="symptoms-box">
        <div className="symptoms-label">Enter Symptoms</div>
        Fever, headache, fatigue, dry cough
      </div>
      <div className="diagnoses-label">AI Suggested Diagnoses</div>
      <div className="diagnoses-list">
        {diagnoses.map((diag) => (
          <div key={diag.name} className="diagnosis-item">
            <div className="diag-name">{diag.name}</div>
            <div className="confidence-bar-wrap">
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${diag.confidence}%`, background: diag.color }}
                />
              </div>
              <span className="confidence-pct" style={{ color: diag.color }}>
                {diag.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="ai-insight-box">
        <div className="ai-insight-label">🤖 AI Insights</div>
        <div className="ai-insight-text">
          The patient may be suffering from viral infection. Recommended Tests: CBC, NS1 Antigen,
          Chest X-Ray.
        </div>
      </div>
      <div className="module-actions">
        <button type="button" className="btn-sm btn-cyan">
          Analyze with AI
        </button>
        <button type="button" className="btn-sm btn-outline-sm">
          Generate Treatment Plan
        </button>
        <button type="button" className="btn-sm btn-green">
          🔗 Save to Blockchain
        </button>
      </div>
    </ModuleCard>
  );
}
