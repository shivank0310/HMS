import { benefits } from '@/data/benefits';
import SectionHeader from '@/components/ui/SectionHeader';
import './BenefitsSection.css';

export default function BenefitsSection() {
  return (
    <section id="benefits">
      <div className="container">
        <SectionHeader
          label="Benefits of AI in HMS"
          title="Why MediChain Transforms Care"
          description="The integration of AI with blockchain doesn't just digitize processes — it fundamentally improves patient outcomes and operational efficiency."
        />
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <div>
                <div className="benefit-title">{benefit.title}</div>
                <div className="benefit-desc">{benefit.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
