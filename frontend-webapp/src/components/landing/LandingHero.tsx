interface LandingHeroProps {
  onSignIn: () => void;
}

export default function LandingHero({ onSignIn }: LandingHeroProps) {
  return (
    <section className="landing-hero">
      <div className="glow-orb glow-1" />
      <div className="glow-orb glow-2" />
      <div className="glow-orb glow-3" />
      <div className="container landing-hero-grid">
        <div className="landing-copy">
          <p className="section-label">MediChain HMS</p>
          <h1>Role-based hospital operations with a clean React dashboard.</h1>
          <p className="landing-lead">
            Explore the full patient, doctor, admin, insurance, and billing experience from a single
            TypeScript webapp. The sign-in button below launches the dashboard flow.
          </p>
          <div className="landing-actions">
            <button className="btn btn-primary" onClick={onSignIn}>
              Sign In
            </button>
            <a className="btn btn-secondary" href="#roles">
              View Roles
            </a>
          </div>
        </div>

        <div className="landing-preview card">
          <div className="landing-preview-top">
            <span className="badge b-info">Live demo</span>
            <span className="landing-preview-pill">React + TypeScript</span>
          </div>
          <div className="landing-preview-grid">
            <div className="landing-preview-card">
              <div>Doctors</div>
              <strong>AI treatment insights</strong>
            </div>
            <div className="landing-preview-card">
              <div>Patients</div>
              <strong>Appointments and records</strong>
            </div>
            <div className="landing-preview-card">
              <div>Admins</div>
              <strong>Operations and staffing</strong>
            </div>
            <div className="landing-preview-card">
              <div>Billing</div>
              <strong>Inventory and invoices</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
