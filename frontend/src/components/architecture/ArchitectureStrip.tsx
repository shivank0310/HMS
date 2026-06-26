import { architectureItems } from '@/data/navigation';
import './ArchitectureStrip.css';

export default function ArchitectureStrip() {
  return (
    <div className="architecture-strip">
      <div className="container">
        <div className="architecture-strip-inner">
          {architectureItems.map((item, index) => (
            <div key={item.label} className="architecture-group">
              {index > 0 && <span className="architecture-separator">⟷</span>}
              <div className="architecture-item">
                <span className="architecture-icon">{item.icon}</span>
                <div>
                  <div className="architecture-label">{item.label}</div>
                  <div className="architecture-value">{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
