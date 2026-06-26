interface MetricCardProps {
  icon: string;
  tone: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  label: string;
  value: string;
  note: string;
}

export default function MetricCard({ icon, tone, label, value, note }: MetricCardProps) {
  return (
    <div className="card stat-card">
      <div className={`stat-icon si-${tone}`}>{icon}</div>
      <div>
        <div className="card-lbl">{label}</div>
        <div className="card-val">{value}</div>
        <div className="card-note">{note}</div>
      </div>
    </div>
  );
}
