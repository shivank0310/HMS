import './SectionHeader.css';

interface SectionHeaderProps {
  label: string;
  title: string;
  description: string;
  centered?: boolean;
}

export default function SectionHeader({ label, title, description, centered }: SectionHeaderProps) {
  return (
    <div className={`section-header ${centered ? 'section-header--centered' : ''}`}>
      <div className="section-label">{label}</div>
      <h2 className="section-title">{title}</h2>
      <p className="section-desc">{description}</p>
    </div>
  );
}
