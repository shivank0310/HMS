import type { SessionUser } from '@/types';

interface SidebarProps {
  user: SessionUser;
  activeMenu: string;
  onSelectMenu: (label: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeMenu, onSelectMenu, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a href="#top" className="sidebar-brand">
        <div className="sidebar-logo">⚕</div>
        <div>
          <div className="sidebar-title">MediChain</div>
          <div className="sidebar-subtitle">HMS v2.0</div>
        </div>
      </a>

      <div className="sidebar-role-badge">
        <div className="srb-avatar">{user.icon}</div>
        <div>
          <div className="srb-name">{user.name}</div>
          <div className="srb-role">{user.role}</div>
        </div>
      </div>

      <div className="sidebar-label">{user.sidebarLabel}</div>
      <ul className="sidebar-menu">
        {user.menu.map((item) => (
          <li key={item.label}>
            <a
              href="#top"
              className={activeMenu === item.label ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                onSelectMenu(item.label);
              }}
            >
              <span>{item.icon}</span> {item.label}
            </a>
          </li>
        ))}
      </ul>

      <button className="logout-btn" onClick={onLogout}>
        🚪 Sign Out
      </button>
    </aside>
  );
}
