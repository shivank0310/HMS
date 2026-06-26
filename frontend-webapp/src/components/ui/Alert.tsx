import type { ReactNode } from 'react';

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  tone: AlertTone;
  children: ReactNode;
}

export default function Alert({ tone, children }: AlertProps) {
  return <div className={`alert alert-${tone}`}>{children}</div>;
}
