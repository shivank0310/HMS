interface ProgressBarProps {
  label: string;
  value: string;
  valueColor?: string;
  percent: number;
  gradient: string;
}

export default function ProgressBar({ label, value, valueColor, percent, gradient }: ProgressBarProps) {
  return (
    <div className="prog-wrap">
      <div className="prog-head">
        <span>{label}</span>
        <span style={valueColor ? { color: valueColor } : undefined}>{value}</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${percent}%`, background: gradient }} />
      </div>
    </div>
  );
}
