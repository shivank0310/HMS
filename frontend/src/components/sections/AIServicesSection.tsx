import { aiServices } from '@/data/aiServices';
import SectionHeader from '@/components/ui/SectionHeader';
import './AIServicesSection.css';

export default function AIServicesSection() {
  return (
    <section id="ai" className="ai-services-section">
      <div className="glow-orb glow-3" />
      <div className="container ai-services-container">
        <SectionHeader
          label="AI Service Layer"
          title="Intelligent AI Modules"
          description="Six specialized AI engines work in parallel to automate diagnostics, detect fraud, predict resource needs, and flag dangerous drug interactions."
        />
        <div className="ai-services-grid">
          {aiServices.map((service) => (
            <div key={service.name} className="service-card">
              <div className="service-icon" style={{ background: service.iconBg }}>
                {service.icon}
              </div>
              <div className="service-name">{service.name}</div>
              <div className="service-desc">{service.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
