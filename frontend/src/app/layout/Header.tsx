type Props = {
  title: string;
  subtitle?: string;
  currentSection?: string;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
  showAdminActions?: boolean;
  onToggleSidebar?: () => void;
};

export const Header = ({
  title,
  subtitle,
  currentSection,
  onLogout,
  userName,
  userRole,
  showAdminActions,
  onToggleSidebar
}: Props) => (
  <div className="page-header">
    <div>
      <div className="title-row">
        <h1 className="header-title-pill">{title}</h1>
      </div>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
    </div>
    <div className="header-actions">
      {onToggleSidebar ? (
        <button
          className="btn btn-light icon-button sidebar-open-btn"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      ) : null}
      {showAdminActions ? (
        <>
          <button className="btn btn-outline-primary">Export</button>
          <button className="btn btn-primary">New Item</button>
        </>
      ) : null}
      <button className="btn btn-light icon-button" aria-label="Notifications">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 1 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
        </svg>
        <span className="dot" />
      </button>
      <div className="dropdown">
        <button
          className="btn btn-light d-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span className="avatar">{(userName ?? 'U').slice(0, 2).toUpperCase()}</span>
          <span className="d-none d-md-inline">{userName ?? 'User'}</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm">
          <li className="px-3 py-2">
            <div className="fw-semibold">{userName ?? 'User'}</div>
            <div className="text-muted small">{userRole ?? 'User'}</div>
          </li>
          <li><hr className="dropdown-divider" /></li>
          {onLogout ? (
            <li>
              <button className="dropdown-item" onClick={onLogout}>
                Logout
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  </div>
);
