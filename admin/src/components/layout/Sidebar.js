import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Box, ShoppingBag, Users, TicketPercent, Image, Settings, HelpCircle, ChevronLeft, ChevronRight, } from 'lucide-react';
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
];
export function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    return (_jsxs("aside", { className: classNames(styles.sidebar, collapsed && styles.collapsed), "aria-label": "Main navigation", children: [_jsxs("div", { className: styles.brand, children: [!collapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: styles.logo, "aria-hidden": "true", children: "SCG" }), _jsx("span", { className: styles.title, children: "Shreeji Admin" })] })), _jsx("button", { type: "button", className: styles.toggle, onClick: () => setCollapsed(!collapsed), "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar', "aria-expanded": !collapsed, children: collapsed ? _jsx(ChevronRight, { size: 18 }) : _jsx(ChevronLeft, { size: 18 }) })] }), _jsx("nav", { className: styles.nav, children: _jsx("ul", { className: styles.list, role: "list", children: navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                        const Icon = item.icon;
                        return (_jsx("li", { className: styles.item, children: _jsxs(NavLink, { to: item.path, className: ({ isActive: active }) => classNames(styles.link, active && styles.active), "aria-current": isActive ? 'page' : undefined, children: [_jsx("span", { className: styles.icon, "aria-hidden": "true", children: _jsx(Icon, { size: 18, strokeWidth: 2 }) }), !collapsed && _jsx("span", { className: styles.label, children: item.label })] }) }, item.path));
                    }) }) })] }));
}
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
