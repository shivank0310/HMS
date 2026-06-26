import LandingHero from '@/components/landing/LandingHero';

interface HomePageProps {
  onSignIn: () => void;
}

export default function HomePage({ onSignIn }: HomePageProps) {
  return (
    <main className="home-page">
      <header className="home-nav">
        <div className="home-brand">
          <span className="home-brand-icon">⚕</span>
          <div>
            <strong>MediChain HMS</strong>
            <span>Hospital management webapp</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onSignIn}>
          Sign In
        </button>
      </header>

      <LandingHero onSignIn={onSignIn} />

      <section className="container home-section" id="roles">
        <div className="section-hdr">
          <h2>Designed around the same role matrix as the HTML dashboard</h2>
          <p>Each area is split into a separate React component so the app stays maintainable.</p>
        </div>
        <div className="home-feature-grid">
          <div className="card">
            <h3>Doctor workflow</h3>
            <p>Queue, AI suggestions, treatment plans, and accuracy metrics.</p>
          </div>
          <div className="card">
            <h3>Patient portal</h3>
            <p>Vitals, appointments, medication schedule, and personal records.</p>
          </div>
          <div className="card">
            <h3>Hospital ops</h3>
            <p>Occupancy, compliance, maintenance, staffing, and finance snapshot.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
