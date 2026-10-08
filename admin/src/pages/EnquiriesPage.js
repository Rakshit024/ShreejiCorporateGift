import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './EnquiriesPage.module.css';
const STATUS_BADGE = {
    new: 'gold', contacted: 'navy', quoted: 'warning', won: 'success', lost: 'danger',
};
export function EnquiriesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [statusFilter, setStatusFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.enquiries.list({ page, limit: 20, search, sort, status: statusFilter });
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
    useEffect(() => { fetchData(); }, [page, search, sort, statusFilter]);
    const openDetail = (e) => { setDetail(e); setModalOpen(true); };
    const columns = [
        { key: 'reference', header: 'Ref', width: '110px' },
        { key: 'name', header: 'Customer', render: (e) => (_jsxs("div", { children: [_jsx("strong", { children: e.name }), _jsx("br", {}), _jsx("small", { style: { color: 'var(--color-text-muted)' }, children: e.companyName || '—' })] })) },
        { key: 'contact', header: 'Contact', width: '180px', render: (e) => (_jsxs("div", { children: [_jsxs("div", { children: [_jsx(Mail, { size: 12 }), " ", e.email] }), _jsxs("div", { children: [_jsx(Phone, { size: 12 }), " ", e.phone] })] })) },
        { key: 'product', header: 'Product', width: '140px' },
        { key: 'quantity', header: 'Qty', width: '70px', align: 'center' },
        { key: 'status', header: 'Status', width: '110px', align: 'center', render: (e) => _jsx(Badge, { variant: STATUS_BADGE[e.status], children: e.status }) },
        { key: 'createdAt', header: 'Date', width: '140px', render: (e) => formatRelativeTime(e.createdAt) },
        { key: 'actions', header: '', width: '100px', render: (e) => (_jsx("div", { className: styles.actions, children: _jsx("button", { className: styles.iconBtn, onClick: () => openDetail(e), "aria-label": "View details", children: _jsx(Edit, { size: 16 }) }) })) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsx("header", { className: styles.header, children: _jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Enquiries" }), _jsx("p", { className: styles.subtitle, children: "Bulk quote requests from the storefront" })] }) }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search enquiries\u2026", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [
                            { value: '', label: 'All Status' },
                            { value: 'new', label: 'New' },
                            { value: 'contacted', label: 'Contacted' },
                            { value: 'quoted', label: 'Quoted' },
                            { value: 'won', label: 'Won' },
                            { value: 'lost', label: 'Lost' },
                        ], value: statusFilter, onChange: e => { setStatusFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: '-createdAt', label: 'Newest' },
                            { value: 'createdAt', label: 'Oldest' },
                            { value: 'reference', label: 'Reference' },
                        ], value: sort, onChange: e => { setSort(e.target.value); setPage(1); }, className: styles.filterSelect })] }), _jsx(Table, { columns: columns, data: data, keyExtractor: e => e.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No enquiries found" }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setDetail(null); }, title: `Enquiry ${detail?.reference}`, size: "lg", children: detail && (_jsxs("div", { className: styles.detail, children: [_jsxs("div", { className: styles.detailRow, children: [_jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Customer" }), _jsx("p", { children: _jsx("strong", { children: detail.name }) }), _jsx("p", { children: detail.companyName || '—' }), _jsxs("p", { children: [_jsx(Mail, { size: 14 }), " ", detail.email] }), _jsxs("p", { children: [_jsx(Phone, { size: 14 }), " ", detail.phone] })] }), _jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Details" }), _jsxs("p", { children: [_jsx(MapPin, { size: 14 }), " ", detail.deliveryLocation || '—'] }), _jsxs("p", { children: [_jsx(Calendar, { size: 14 }), " Required: ", detail.requiredDate || '—'] }), _jsxs("p", { children: ["Qty: ", detail.quantity] }), _jsxs("p", { children: ["Branding: ", detail.brandingRequired || '—'] })] })] }), _jsx("hr", { className: styles.detailDivider }), _jsx("h4", { children: "Items" }), _jsx(Table, { columns: [
                                { key: 'productName', header: 'Product', render: (i) => _jsx("strong", { children: i.productName }) },
                                { key: 'quantity', header: 'Qty', width: '70px', align: 'center' },
                                { key: 'brandingLabel', header: 'Branding', width: '140px' },
                                { key: 'unitPrice', header: 'Unit Price', width: '120px', align: 'right', render: (i) => `₹${i.unitPrice.toLocaleString()}` },
                            ], data: detail.items, keyExtractor: (item) => item.id }), _jsx("div", { className: styles.detailFooter, children: _jsxs("div", { className: styles.detailActions, children: [_jsxs("label", { className: styles.statusSelect, children: ["Status", _jsx(Select, { options: Object.keys(STATUS_BADGE).map(k => ({ value: k, label: k })), value: detail.status, onChange: async (e) => {
                                                    const v = e.target.value;
                                                    await api.enquiries.update(detail.id, { status: v });
                                                    setDetail({ ...detail, status: v });
                                                    fetchData();
                                                } })] }), _jsx(Button, { variant: "outline", onClick: () => setDetail(null), children: "Close" })] }) }), _jsxs("div", { className: styles.notes, children: [_jsx("h4", { children: "Message" }), _jsx("p", { style: { whiteSpace: 'pre-wrap' }, children: detail.message || '—' }), _jsx("h4", { children: "Admin Notes" }), _jsx("textarea", { value: detail.adminNotes, onChange: async (e) => {
                                        await api.enquiries.update(detail.id, { adminNotes: e.target.value });
                                        setDetail({ ...detail, adminNotes: e.target.value });
                                    }, rows: 3, className: styles.notesTextarea, placeholder: "Add internal notes\u2026" })] })] })) })] }));
}
