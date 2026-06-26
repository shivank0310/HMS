import type { ReactNode } from 'react';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'purple';

const toneClass: Record<BadgeTone, string> = {
  success: 'b-success',
  warning: 'b-warning',
  danger: 'b-danger',
  info: 'b-info',
  purple: 'b-purple',
};

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

export default function Badge({ tone, children }: BadgeProps) {
  return <span className={`badge ${toneClass[tone]}`}>{children}</span>;
}
