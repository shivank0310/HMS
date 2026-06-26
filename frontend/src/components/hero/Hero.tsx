import { heroStats } from '@/data/navigation';
import { scrollToSection, useCounterAnimation } from '@/hooks/useCounterAnimation';
import NetworkCanvas from './NetworkCanvas';
import BlockchainVisual from './BlockchainVisual';
import './Hero.css';

function HeroStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const display = useCounterAnimation(value, suffix);
  return (
    <div>
      <div className="hero-stat-val">{display}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="glow-orb glow-1" />
      <div className="glow-orb glow-2" />
      <NetworkCanvas />
      <div className="hero-content">
        <div>
          <div className="hero-badge">
            <span>🔗</span> AI + Hyperledger Fabric + IPFS Architecture
          </div>
          <h1 className="hero-title">
            Hospital Management
            <br />
            <span className="accent">Smarter</span> with <span className="accent2">Blockchain</span>
          </h1>
          <p className="hero-desc">
            A next-generation Hospital Management System powered by AI diagnostics, Hyperledger
            Fabric blockchain, and IPFS decentralized storage — making healthcare faster, safer, and
            more transparent.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-hero btn-hero-primary"
              onClick={() => scrollToSection('modules')}
            >
              ▶ Explore Dashboards
            </button>
            <button
              type="button"
              className="btn-hero btn-hero-outline"
              onClick={() => scrollToSection('blockchain')}
            >
              🔗 View Blockchain
            </button>
          </div>
          <div className="hero-stats">
            {heroStats.map((stat) => (
              <HeroStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <BlockchainVisual />
      </div>
    </section>
  );
}
