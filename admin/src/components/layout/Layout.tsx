import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './Layout.module.css';

export function Layout() {
  
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleMenuClick = () => setSidebarOpen(!sidebarOpen);

  

  return (
    <div className={styles.layout}>
      <Sidebar />
      <Topbar onMenuClick={handleMenuClick} />
      <main
        className={classNames(
          styles.main,
          collapsed && styles.mainCollapsed,
          sidebarOpen && styles.sidebarOpen
        )}
        style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
      >
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        <Outlet />
      </main>
    </div>
  );
}

function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}