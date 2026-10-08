import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, Trash2, User, Shield } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './CustomersPage.module.css';
export function CustomersPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-totalSpent');
    const [blockedFilter, setBlockedFilter] = useState('');
    const [detail, setDetail] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.customers.list({ page, limit: 20, search, sort, isBlocked: blockedFilter === 'blocked' ? true : blockedFilter === 'active' ? false : undefined });
            setData(res.items);
            setTotal(res.total);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, [page, search, sort, blockedFilter]);
    const openDetail = (c) => { setDetail(c); };
    const confirmDelete = (id) => setDeleting(id);
    const handleDelete = async () => { if (!deleting)
        return; await api.customers.delete(deleting); setDeleting(null); fetchData(); };
    const toggleBlocked = async (id) => { await api.customers.toggleBlocked(id); fetchData(); };
    const columns = [
        { key: 'name', header: 'Customer', render: (c) => (_jsxs("div", { children: [_jsx("strong", { children: c.name }), c.companyName && _jsxs(_Fragment, { children: [" ", _jsx("br", {}), _jsx("small", { style: { color: 'var(--color-text-muted)' }, children: c.companyName }), " "] })] })) },
        { key: 'email', header: 'Email', width: '200px' },
        { key: 'phone', header: 'Phone', width: '140px' },
        { key: 'totalSpent', header: 'Total Spent', width: '120px', align: 'right', render: (c) => `₹${c.totalSpent.toLocaleString()}` },
        { key: 'orderCount', header: 'Orders', width: '80px', align: 'center' },
        { key: 'enquiryCount', header: 'Enquiries', width: '90px', align: 'center' },
        { key: 'isBlocked', header: 'Status', width: '100px', align: 'center', render: (c) => _jsx(Badge, { variant: c.isBlocked ? 'danger' : 'success', children: c.isBlocked ? 'Blocked' : 'Active' }) },
        { key: 'createdAt', header: 'Joined', width: '140px', render: (c) => formatRelativeTime(c.createdAt) },
        { key: 'actions', header: '', width: '130px', render: (c) => (_jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.iconBtn, onClick: () => openDetail(c), "aria-label": "View", children: _jsx(User, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => toggleBlocked(c.id), "aria-label": c.isBlocked ? 'Unblock' : 'Block', style: { color: c.isBlocked ? 'var(--color-success)' : 'var(--color-danger)' }, children: _jsx(Shield, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => confirmDelete(c.id), "aria-label": "Delete", children: _jsx(Trash2, { size: 16 }) })] })) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsx("header", { className: styles.header, children: _jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Customers" }), _jsx("p", { className: styles.subtitle, children: "Manage customer accounts and order history" })] }) }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search customers\u2026", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [
                            { value: '', label: 'All' },
                            { value: 'active', label: 'Active' },
                            { value: 'blocked', label: 'Blocked' },
                        ], value: blockedFilter, onChange: e => { setBlockedFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: '-totalSpent', label: 'Top Spenders' },
                            { value: '-createdAt', label: 'Newest' },
                            { value: 'createdAt', label: 'Oldest' },
                            { value: 'name', label: 'Name A–Z' },
                        ], value: sort, onChange: e => { setSort(e.target.value); setPage(1); }, className: styles.filterSelect })] }), _jsx(Table, { columns: columns, data: data, keyExtractor: c => c.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No customers found" }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: !!detail, onClose: () => setDetail(null), title: detail?.name, size: "lg", children: detail && (_jsxs("div", { className: styles.detail, children: [_jsxs("div", { className: styles.detailGrid, children: [_jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Contact" }), _jsx("p", { children: _jsx("strong", { children: detail.name }) }), _jsx("p", { children: detail.companyName || '—' }), _jsx("p", { children: detail.email }), _jsx("p", { children: detail.phone || '—' })] }), _jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Address" }), _jsx("p", { children: detail.billingAddress?.line1 || '—' }), _jsx("p", { children: [detail.billingAddress?.city, detail.billingAddress?.state, detail.billingAddress?.postalCode].filter(Boolean).join(', ') || '—' }), _jsx("p", { children: detail.billingAddress?.country || 'India' })] }), _jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Stats" }), _jsxs("p", { children: ["Orders: ", detail.orderCount] }), _jsxs("p", { children: ["Enquiries: ", detail.enquiryCount] }), _jsxs("p", { children: ["Total Spent: \u20B9", detail.totalSpent.toLocaleString()] }), _jsxs("p", { children: ["Last Order: ", detail.lastOrderAt ? formatRelativeTime(detail.lastOrderAt) : 'Never'] })] })] }), _jsx("hr", { className: styles.detailDivider }), _jsxs("div", { className: styles.detailFooter, children: [_jsx(Button, { variant: detail.isBlocked ? 'success' : 'danger', onClick: () => toggleBlocked(detail.id), children: detail.isBlocked ? 'Unblock Customer' : 'Block Customer' }), _jsx(Button, { variant: "outline", onClick: () => setDetail(null), children: "Close" })] })] })) }), _jsxs(Modal, { open: !!deleting, onClose: () => setDeleting(null), title: "Delete Customer", size: "sm", children: [_jsx("p", { children: "Are you sure you want to delete this customer? This cannot be undone." }), _jsxs("div", { className: styles.modalActions, children: [_jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, children: "Delete" })] })] })] }));
}
