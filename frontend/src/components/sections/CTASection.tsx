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
          <button type="button" className="btn-hero btn-hero-primary">
            ▶ Request a Demo
          </button>
          <button type="button" className="btn-hero btn-hero-outline">
            📄 Read Documentation
          </button>
        </div>
      </div>
    </section>
  );
}
