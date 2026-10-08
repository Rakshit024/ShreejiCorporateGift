import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Box,
  ShoppingBag,
  Users,
  TicketPercent,
  Image,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/categories', icon: Package, label: 'Categories' },
  { path: '/products', icon: Box, label: 'Products' },
  { path: '/enquiries', icon: HelpCircle, label: 'Enquiries' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/coupons', icon: TicketPercent, label: 'Coupons' },
  { path: '/banners', icon: Image, label: 'Banners' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={classNames(styles.sidebar, collapsed && styles.collapsed)}
      aria-label="Main navigation"
    >
      <div className={styles.brand}>
        {!collapsed && (
          <>
            <span className={styles.logo} aria-hidden="true">SCG</span>
            <span className={styles.title}>Shreeji Admin</span>
          </>
        )}
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.list} role="list">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            const Icon = item.icon;
            return (
              <li key={item.path} className={styles.item}>
                <NavLink
                  to={item.path}
                  className={({ isActive: active }) =>
                    classNames(styles.link, active && styles.active)
                  }
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={styles.icon} aria-hidden="true"><Icon size={18} strokeWidth={2} /></span>
                  {!collapsed && <span className={styles.label}>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}