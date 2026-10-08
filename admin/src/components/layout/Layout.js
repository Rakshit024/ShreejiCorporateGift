import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: styles.layout, children: [_jsx(Sidebar, {}), _jsx(Topbar, { onMenuClick: handleMenuClick }), _jsxs("main", { className: classNames(styles.main, collapsed && styles.mainCollapsed, sidebarOpen && styles.sidebarOpen), style: { marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }, children: [_jsx("div", { className: styles.backdrop, onClick: () => setSidebarOpen(false), "aria-hidden": "true" }), _jsx(Outlet, {})] })] }));
}
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
