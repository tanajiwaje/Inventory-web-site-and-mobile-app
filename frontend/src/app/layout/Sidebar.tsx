import { NavLink } from 'react-router-dom';

type NavItem = {
  label: string;
  to: string;
  icon:
    | 'dashboard'
    | 'inventory'
    | 'adjustments'
    | 'stock'
    | 'suppliers'
    | 'customers'
    | 'locations'
    | 'purchase'
    | 'sales'
    | 'returns'
    | 'audit'
    | 'users'
    | 'settings'
    | 'profile';
};

type Props = {
  activeSection: string;
  role?: string;
  basePath: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  company?: {
    name?: string;
    logoUrl?: string;
    websiteUrl?: string;
  } | null;
};

const Icon = ({ name }: { name: NavItem['icon'] }) => {
  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </svg>
    );
  }
  if (name === 'inventory') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7l9-4 9 4-9 4-9-4Z" />
        <path d="M3 7v10l9 4 9-4V7" />
      </svg>
    );
  }
  if (name === 'adjustments') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
        <circle cx="8" cy="7" r="2" />
        <circle cx="16" cy="12" r="2" />
        <circle cx="10" cy="17" r="2" />
      </svg>
    );
  }
  if (name === 'stock' || name === 'locations') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (name === 'suppliers') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M8 6V4h8v2" />
      </svg>
    );
  }
  if (name === 'customers' || name === 'users' || name === 'profile') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  if (name === 'purchase') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="19" r="1.6" />
        <circle cx="17" cy="19" r="1.6" />
        <path d="M3 5h2l2.4 10h10.2l2-7H7.2" />
      </svg>
    );
  }
  if (name === 'sales') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18h16" />
        <rect x="6" y="12" width="2.5" height="6" />
        <rect x="10.75" y="9" width="2.5" height="9" />
        <rect x="15.5" y="6" width="2.5" height="12" />
      </svg>
    );
  }
  if (name === 'returns') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7h8a5 5 0 1 1 0 10H7" />
        <path d="M9 4 5 7l4 3" />
      </svg>
    );
  }
  if (name === 'audit') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6v6c0 5 3.6 8 7 9 3.4-1 7-4 7-9V6l-7-3Z" />
        <path d="m9.5 12 2 2 3-3.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </svg>
  );
};

export const Sidebar = ({
  activeSection,
  role,
  basePath,
  collapsed,
  onToggleCollapse,
  onNavigate,
  company
}: Props) => {
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSeller = role === 'seller';
  const isBuyer = role === 'buyer';

  const adminItems: NavItem[] = [
    { label: 'Dashboard', to: `${basePath}/dashboard`, icon: 'dashboard' },
    { label: 'Inventory', to: `${basePath}/inventory`, icon: 'inventory' },
    { label: 'Adjustments', to: `${basePath}/adjustments`, icon: 'adjustments' },
    { label: 'Location Stock', to: `${basePath}/stock-locations`, icon: 'stock' },
    { label: 'Suppliers', to: `${basePath}/suppliers`, icon: 'suppliers' },
    { label: 'Customers', to: `${basePath}/customers`, icon: 'customers' },
    { label: 'Locations', to: `${basePath}/locations`, icon: 'locations' },
    { label: 'Purchase Orders', to: `${basePath}/purchase-orders`, icon: 'purchase' },
    { label: 'Sales Orders', to: `${basePath}/sales-orders`, icon: 'sales' },
    { label: 'Returns', to: `${basePath}/returns`, icon: 'returns' },
    { label: 'Audit Logs', to: `${basePath}/audit-logs`, icon: 'audit' },
    { label: 'User Onboarding', to: `${basePath}/user-onboarding`, icon: 'users' },
    { label: 'Company Settings', to: `${basePath}/company-settings`, icon: 'settings' }
  ];

  const visibleItems = (() => {
    if (isAdmin) return adminItems;
    if (isSeller) {
      return [
        { label: 'Dashboard', to: `${basePath}/dashboard`, icon: 'dashboard' },
        { label: 'Purchase Orders', to: `${basePath}/purchase-orders`, icon: 'purchase' },
        { label: 'Profile', to: `${basePath}/profile`, icon: 'profile' }
      ];
    }
    if (isBuyer) {
      return [
        { label: 'Dashboard', to: `${basePath}/dashboard`, icon: 'dashboard' },
        { label: 'Sales Orders', to: `${basePath}/sales-orders`, icon: 'sales' },
        { label: 'Profile', to: `${basePath}/profile`, icon: 'profile' }
      ];
    }
    return [{ label: 'Dashboard', to: `${basePath}/dashboard`, icon: 'dashboard' }];
  })();
  return (
  <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
    <div className="sidebar-top">
      <div className="logo">
        {company?.logoUrl ? (
          <img src={company.logoUrl} alt="Company logo" className="logo-image" />
        ) : (
          <div className="logo-mark">I</div>
        )}
        <div className="logo-text">
          <strong>{company?.name ?? 'Inventra'}</strong>
          <span className="muted">Control Center</span>
        </div>
      </div>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggleCollapse}
      >
        {collapsed ? '>' : '<'}
      </button>
    </div>
    <nav className="sidebar-nav">
      {visibleItems.map((item) => {
        const isActive = item.to.endsWith(`/${activeSection}`);
        return (
        <NavLink
          key={item.to}
          to={item.to}
          className={isActive ? 'active' : ''}
          title={collapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          <span className="nav-icon"><Icon name={item.icon} /></span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      )})}
    </nav>
    <div className="sidebar-footer">
      <span className="pill">v1.0</span>
      <span className="muted">All systems normal</span>
    </div>
  </aside>
  );
};
