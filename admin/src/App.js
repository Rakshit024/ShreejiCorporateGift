import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductsPage } from './pages/ProductsPage';
import { EnquiriesPage } from './pages/EnquiriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { CouponsPage } from './pages/CouponsPage';
import { BannersPage } from './pages/BannersPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './context/AuthContext';
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return null;
    return user ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login", replace: true });
}
function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return null;
    return user ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(_Fragment, { children: children });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(PublicRoute, { children: _jsx(LoginPage, {}) }) }), _jsxs(Route, { element: _jsx(ProtectedRoute, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/categories", element: _jsx(CategoriesPage, {}) }), _jsx(Route, { path: "/products", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "/enquiries", element: _jsx(EnquiriesPage, {}) }), _jsx(Route, { path: "/orders", element: _jsx(OrdersPage, {}) }), _jsx(Route, { path: "/customers", element: _jsx(CustomersPage, {}) }), _jsx(Route, { path: "/coupons", element: _jsx(CouponsPage, {}) }), _jsx(Route, { path: "/banners", element: _jsx(BannersPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
