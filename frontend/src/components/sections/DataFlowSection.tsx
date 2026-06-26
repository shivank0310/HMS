import { dataFlowSteps } from '@/data/dataFlow';
import SectionHeader from '@/components/ui/SectionHeader';
import './DataFlowSection.css';

export default function DataFlowSection() {
  return (
    <section id="dataflow">
      <div className="container">
        <SectionHeader
          label="AI Data Flow"
          title="How Data Moves Through the System"
          description="From the first user interaction to secure blockchain storage — every action is processed, analyzed by AI, and permanently recorded."
        />
        <div className="flow-steps">
          {dataFlowSteps.map((step) => (
            <div key={step.name} className="flow-step">
              <div className="flow-icon" style={{ background: step.iconBg }}>
                {step.icon}
              </div>
              <div className="flow-step-name">{step.name}</div>
              <div className="flow-step-desc">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
