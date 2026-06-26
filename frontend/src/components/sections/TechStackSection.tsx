import { techStack } from '@/data/techStack';
import SectionHeader from '@/components/ui/SectionHeader';
import './TechStackSection.css';

export default function TechStackSection() {
  return (
    <section id="tech" className="tech-section">
      <div className="container">
        <SectionHeader
          label="AI Models & Technologies"
          title="Powered by State-of-the-Art ML"
          description="A multi-model AI stack combines classical ML, deep learning, NLP, computer vision, and time-series forecasting for comprehensive healthcare intelligence."
        />
        <div className="tech-grid">
          {techStack.map((tech) => (
            <div key={tech.name} className="tech-card">
              <div className="tech-icon">{tech.icon}</div>
              <div className="tech-name">{tech.name}</div>
              <div className="tech-desc">{tech.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
