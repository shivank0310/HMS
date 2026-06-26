import type { ReactNode } from 'react';

interface ItemRowProps {
  title: string;
  subtitle: string;
  right?: ReactNode;
  accent?: string;
}

export default function ItemRow({ title, subtitle, right, accent }: ItemRowProps) {
  return (
    <div className="item-row" style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}>
      <div className="item-row-head">
        <span className="item-row-title">{title}</span>
        {right}
      </div>
      <div className="item-row-sub">{subtitle}</div>
    </div>
  );
}
