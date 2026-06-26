import { ReactNode } from 'react';
import './ModuleCard.css';

interface ModuleCardProps {
  number: number;
  title: string;
  badge: string;
  badgeType: 'ai' | 'live';
  children: ReactNode;
}

export default function ModuleCard({ number, title, badge, badgeType, children }: ModuleCardProps) {
  return (
    <div className="module-card">
      <div className="module-header">
        <div className="module-title-row">
          <div className="module-num">{number}</div>
          <div className="module-title">{title}</div>
        </div>
        <span className={`module-badge badge-${badgeType}`}>{badge}</span>
      </div>
      <div className="module-body">{children}</div>
    </div>
  );
}
