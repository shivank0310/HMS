interface TopBarProps {
  title: string;
  subtitle: string;
  search: string;
  onOpenMenu: () => void;
}

export default function TopBar({ title, subtitle, search, onOpenMenu }: TopBarProps) {
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="top-bar" id="top">
      <button className="mobile-menu-btn" type="button" aria-label="Open menu" onClick={onOpenMenu}>
        ☰
      </button>
      <div>
        <div className="top-bar-title">{title}</div>
        <div className="top-bar-subtitle">{subtitle}</div>
      </div>
      <div className="top-bar-right">
        <input type="text" className="search-box" placeholder={search} />
        <button className="notif-btn" type="button" aria-label="Notifications">
          🔔<span className="notif-dot" />
        </button>
        <div className="top-bar-date">{date}</div>
      </div>
    </div>
  );
}
