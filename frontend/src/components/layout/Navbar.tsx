import { navLinks } from '@/data/navigation';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-logo">⚕</div>
        <span className="nav-brand-text">MediChain HMS</span>
      </div>
      <ul className="nav-links">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        <div className="live-dot" />
        <button type="button" className="btn-ghost">
          Sign In
        </button>
        <button type="button" className="btn-primary">
          Get Demo
        </button>
      </div>
    </nav>
  );
}
