import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Package, DollarSign, AlertCircle, Package as PackageIcon } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './DashboardPage.module.css';
const STAT_CARDS = [
    { key: 'totalProducts', label: 'Total Products', icon: PackageIcon, color: 'var(--color-navy)', bg: 'rgba(7,31,67,0.08)' },
    { key: 'availableProducts', label: 'Available', icon: Package, color: '#166534', bg: 'rgba(22,101,52,0.1)' },
    { key: 'lowStockProducts', label: 'Low Stock', icon: AlertCircle, color: 'var(--color-gold-hover)', bg: 'var(--color-gold-muted)' },
    { key: 'totalCategories', label: 'Categories', icon: Package, color: 'var(--color-teal)', bg: 'var(--color-teal-muted)' },
    { key: 'newEnquiries', label: 'New Enquiries', icon: AlertCircle, color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
    { key: 'revenueLast30Days', label: 'Revenue (30d)', icon: DollarSign, color: '#166534', bg: 'rgba(22,101,52,0.1)', isCurrency: true },
];
export function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [recentEnquiries, setRecentEnquiries] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [dash, enq, stock] = await Promise.all([
                    api.admin.dashboard(),
                    api.enquiries.list({ limit: 5, sort: '-createdAt' }),
                    api.admin.stockAlerts(),
                ]);
                setStats(dash);
                setRecentEnquiries(enq.items);
                setLowStock(stock.items);
                setTopProducts(dash.topProducts);
                setRevenueTrend(dash.revenueTrend);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        load();
    }, []);
    if (loading)
        return _jsx("div", { className: styles.loading, children: "Loading dashboard\u2026" });
    const getStatValue = (key) => stats?.[key] ?? 0;
    return (_jsxs("div", { className: styles.page, children: [_jsxs("header", { className: styles.header, children: [_jsx("h1", { className: styles.title, children: "Dashboard" }), _jsx("p", { className: styles.subtitle, children: "Overview of your corporate gifting business" })] }), _jsx("section", { className: styles.grid, "aria-label": "Key metrics", children: STAT_CARDS.map((card) => {
                    const value = card.key.includes('.') ? card.key.split('.').reduce((o, k) => o?.[k], stats) : getStatValue(card.key);
                    return (_jsxs("article", { className: styles.card, style: { '--card-color': card.color, '--card-bg': card.bg }, children: [_jsx("div", { className: styles.cardIcon, style: { background: card.bg, color: card.color }, children: _jsx(card.icon, { size: 22, strokeWidth: 2, "aria-hidden": "true" }) }), _jsxs("div", { className: styles.cardContent, children: [_jsx("p", { className: styles.cardLabel, children: card.label }), _jsx("p", { className: styles.cardValue, children: card.key === 'revenueLast30Days' ? formatCurrency(value) : value.toLocaleString() })] })] }, card.key));
                }) }), _jsxs("div", { className: styles.twoCol, children: [_jsxs("section", { className: styles.panel, "aria-labelledby": "enquiries-heading", children: [_jsxs("header", { className: styles.panelHeader, children: [_jsx("h2", { id: "enquiries-heading", className: styles.panelTitle, children: "Recent Enquiries" }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx("a", { href: "/enquiries", children: "View all" }) })] }), _jsx(Table, { data: recentEnquiries, keyExtractor: (e) => e.id, columns: [
                                    { key: 'reference', header: 'Ref', width: '110px' },
                                    { key: 'name', header: 'Customer', render: (e) => _jsx("strong", { children: e.name }) },
                                    { key: 'companyName', header: 'Company', width: '140px' },
                                    { key: 'status', header: 'Status', width: '110px', render: (e) => _jsx(Badge, { variant: STATUS_BADGE[e.status], children: e.status }) },
                                    { key: 'createdAt', header: 'Date', width: '140px', render: (e) => formatRelativeTime(e.createdAt) },
                                ] })] }), _jsxs("section", { className: styles.panel, "aria-labelledby": "stock-heading", children: [_jsxs("header", { className: styles.panelHeader, children: [_jsx("h2", { id: "stock-heading", className: styles.panelTitle, children: "Low Stock Alerts" }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx("a", { href: "/products?stock=low", children: "View all" }) })] }), _jsx(Table, { data: lowStock, keyExtractor: (p) => p.id, columns: [
                                    { key: 'image', header: '', width: '48px', render: (p) => _jsx("img", { src: p.image || '/placeholder.svg', alt: "", className: styles.thumb }) },
                                    { key: 'name', header: 'Product', render: (p) => _jsx("strong", { children: p.name }) },
                                    { key: 'category', header: 'Category', width: '130px' },
                                    { key: 'stock', header: 'Stock', width: '80px', render: (p) => _jsxs(Badge, { variant: p.stock === 0 ? 'danger' : 'warning', children: [p.stock, " / ", p.lowStockThreshold] }) },
                                ] })] })] }), _jsxs("section", { className: styles.panel, "aria-labelledby": "revenue-heading", children: [_jsx("header", { className: styles.panelHeader, children: _jsx("h2", { id: "revenue-heading", className: styles.panelTitle, children: "Revenue Trend (Last 14 Days)" }) }), _jsx("div", { className: styles.chartWrap, children: _jsx(RevenueChart, { data: revenueTrend }) })] }), _jsxs("section", { className: styles.panel, "aria-labelledby": "top-heading", children: [_jsx("header", { className: styles.panelHeader, children: _jsx("h2", { id: "top-heading", className: styles.panelTitle, children: "Top Selling Products" }) }), _jsx(Table, { data: topProducts, keyExtractor: (p) => p.id, columns: [
                            { key: 'name', header: 'Product', render: (p) => _jsx("strong", { children: p.name }) },
                            { key: 'sold', header: 'Units Sold', width: '110px', align: 'right' },
                            { key: 'revenue', header: 'Revenue', width: '140px', align: 'right', render: (p) => formatCurrency(p.revenue) },
                        ] })] })] }));
}
const STATUS_BADGE = {
    new: 'gold', contacted: 'navy', quoted: 'warning', won: 'success', lost: 'danger',
};
function RevenueChart({ data }) {
    if (!data?.length)
        return _jsx("p", { className: styles.empty, children: "No revenue data yet." });
    const maxRev = Math.max(...data.map((d) => d.revenue), 1);
    return (_jsx("div", { className: styles.chart, role: "img", "aria-label": "Revenue bar chart", children: data.map((d, _i) => (_jsxs("div", { className: styles.barGroup, children: [_jsx("div", { className: styles.bar, style: { height: `${(d.revenue / maxRev) * 100}%` }, title: `₹${d.revenue.toLocaleString()} • ${d.orders} orders` }), _jsx("span", { className: styles.barLabel, children: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })] }, d.date))) }));
}
