import { websiteLoginUrl } from '@/utils/webapp';
import './CTASection.css';

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="container cta-container">
        <div className="section-label">Get Started</div>
        <h2 className="section-title">Ready to Transform Your Hospital?</h2>
        <p className="section-desc">
          Join forward-thinking hospitals deploying AI + blockchain for smarter, safer, and more
          efficient healthcare delivery.
        </p>
        <div className="cta-actions">
          <a href={websiteLoginUrl} className="btn-hero btn-hero-primary">
            ▶ Open Role Login
          </a>
          <a href="#architecture" className="btn-hero btn-hero-outline">
            📄 View Architecture
          </a>
        </div>
      </div>
    </section>
  );
}
