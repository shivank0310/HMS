import { footerLinkGroups } from '@/data/benefits';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="nav-brand footer-brand">
              <div className="nav-logo">⚕</div>
              <span className="nav-brand-text">MediChain HMS</span>
            </div>
            <p className="footer-brand-text">
              AI + Hyperledger Fabric + IPFS architecture making Hospital Management Systems smarter,
              faster, and more accurate.
            </p>
          </div>
          {footerLinkGroups.map((group) => (
            <div key={group.heading}>
              <div className="footer-heading">{group.heading}</div>
              <ul className="footer-links">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">
            © 2026 MediChain HMS. AI makes healthcare smarter, faster & more accurate.
          </div>
          <div className="footer-hash">
            Latest Block: 0x3f9a...c2b1e · Network: Active · Peers: 12
          </div>
        </div>
      </div>
    </footer>
  );
}
