import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { LogOut, User, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './Topbar.module.css';
export function Topbar({ onMenuClick }) {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [name, setName] = useState(user?.name ?? '');
    const handleSaveName = async () => {
        try {
            await updateProfile(name.trim());
            setProfileOpen(false);
        }
        catch (e) {
            console.error(e);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("header", { className: styles.topbar, role: "banner", children: [_jsx("button", { type: "button", className: styles.menuBtn, onClick: onMenuClick, "aria-label": "Toggle menu", "aria-expanded": "false", children: _jsx(Menu, { size: 22 }) }), _jsx("div", { className: styles.spacer }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { type: "button", className: styles.iconBtn, "aria-label": "Notifications", children: _jsx(Bell, { size: 20 }) }), _jsx("div", { className: styles.divider }), _jsxs("div", { className: styles.profile, onClick: () => setProfileOpen(!profileOpen), children: [_jsx("div", { className: styles.avatar, "aria-hidden": "true", children: user?.name?.charAt(0).toUpperCase() ?? 'U' }), !window.matchMedia('(max-width: 768px)').matches && (_jsxs(_Fragment, { children: [_jsx("span", { className: styles.name, children: user?.name ?? 'Admin' }), _jsx("span", { className: styles.role, children: user?.role ?? 'admin' })] }))] })] }), _jsxs("div", { className: classNames(styles.dropdown, profileOpen && styles.open), children: [_jsxs("div", { className: styles.dropdownHeader, children: [_jsx("div", { className: styles.avatar, style: { width: 40, height: 40, fontSize: '1.1rem' }, "aria-hidden": "true", children: user?.name?.charAt(0).toUpperCase() ?? 'U' }), _jsxs("div", { children: [_jsx("p", { className: styles.dropdownName, children: user?.name ?? 'Admin' }), _jsx("p", { className: styles.dropdownEmail, children: user?.email })] })] }), _jsx("hr", { className: styles.dropdownDivider }), _jsxs("label", { className: styles.dropdownItem, children: [_jsx(User, { size: 16 }), " Your Profile", _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: styles.dropdownInput, placeholder: "Your name" }), _jsx(Button, { size: "sm", variant: "primary", onClick: handleSaveName, children: "Save" })] }), _jsx("hr", { className: styles.dropdownDivider }), _jsxs("button", { type: "button", className: styles.dropdownItem, onClick: handleLogout, children: [_jsx(LogOut, { size: 16 }), " Sign out"] })] })] }));
}
function classNames(...parts) {
    return parts.filter(Boolean).join(' ');
}
