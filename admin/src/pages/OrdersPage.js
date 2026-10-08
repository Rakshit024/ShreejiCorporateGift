import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './OrdersPage.module.css';
const STATUS_BADGE = {
    pending: 'gold', confirmed: 'navy', processing: 'warning', dispatched: 'success', delivered: 'success', cancelled: 'danger',
};
const PAYMENT_BADGE = {
    unpaid: 'danger', partial: 'warning', paid: 'success', refunded: 'navy',
};
export function OrdersPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.orders.list({ page, limit: 20, search, sort, status: statusFilter, paymentStatus: paymentFilter });
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
    useEffect(() => { fetchData(); }, [page, search, sort, statusFilter, paymentFilter]);
    const openDetail = (o) => { setDetail(o); setModalOpen(true); };
    const columns = [
        { key: 'reference', header: 'Order #', width: '120px' },
        { key: 'customerName', header: 'Customer', render: (o) => _jsx("strong", { children: o.customerName }) },
        { key: 'companyName', header: 'Company', width: '140px' },
        { key: 'items', header: 'Items', width: '90px', align: 'center', render: (o) => o.items.length },
        { key: 'total', header: 'Total', width: '120px', align: 'right', render: (o) => formatCurrency(o.total) },
        { key: 'status', header: 'Status', width: '110px', align: 'center', render: (o) => _jsx(Badge, { variant: STATUS_BADGE[o.status], children: o.status }) },
        { key: 'paymentStatus', header: 'Payment', width: '110px', align: 'center', render: (o) => _jsx(Badge, { variant: PAYMENT_BADGE[o.paymentStatus], children: o.paymentStatus }) },
        { key: 'createdAt', header: 'Date', width: '140px', render: (o) => formatRelativeTime(o.createdAt) },
        { key: 'actions', header: '', width: '90px', render: (o) => _jsx("div", { className: styles.actions, children: _jsx("button", { className: styles.iconBtn, onClick: () => openDetail(o), "aria-label": "View", children: _jsx(Edit, { size: 16 }) }) }) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsx("header", { className: styles.header, children: _jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Orders" }), _jsx("p", { className: styles.subtitle, children: "Track and manage customer orders" })] }) }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search orders\u2026", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [
                            { value: '', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'processing', label: 'Processing' },
                            { value: 'dispatched', label: 'Dispatched' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ], value: statusFilter, onChange: e => { setStatusFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: '', label: 'All Payments' },
                            { value: 'unpaid', label: 'Unpaid' },
                            { value: 'partial', label: 'Partial' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'refunded', label: 'Refunded' },
                        ], value: paymentFilter, onChange: e => { setPaymentFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: '-createdAt', label: 'Newest' },
                            { value: 'createdAt', label: 'Oldest' },
                            { value: '-total', label: 'Highest Value' },
                            { value: 'total', label: 'Lowest Value' },
                        ], value: sort, onChange: e => { setSort(e.target.value); setPage(1); }, className: styles.filterSelect })] }), _jsx(Table, { columns: columns, data: data, keyExtractor: o => o.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No orders found" }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setDetail(null); }, title: `Order ${detail?.reference}`, size: "xl", children: detail && (_jsxs("div", { className: styles.detail, children: [_jsxs("div", { className: styles.detailGrid, children: [_jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Customer" }), _jsx("p", { children: _jsx("strong", { children: detail.customerName }) }), _jsx("p", { children: detail.companyName || '—' }), _jsx("p", { children: detail.customerEmail }), _jsx("p", { children: detail.customerPhone || '—' })] }), _jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Delivery" }), _jsx("p", { children: detail.deliveryAddress?.line1 || '—' }), _jsx("p", { children: [detail.deliveryAddress?.city, detail.deliveryAddress?.state, detail.deliveryAddress?.postalCode].filter(Boolean).join(', ') || '—' }), _jsx("p", { children: detail.deliveryAddress?.country || 'India' })] }), _jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Payment" }), _jsxs("p", { children: ["Method: ", detail.paymentMethod || '—'] }), _jsxs("p", { children: ["Status: ", _jsx(Badge, { variant: PAYMENT_BADGE[detail.paymentStatus], children: detail.paymentStatus })] })] }), _jsxs("div", { className: styles.detailCol, children: [_jsx("h4", { children: "Status" }), _jsx("p", { children: _jsx(Badge, { variant: STATUS_BADGE[detail.status], children: detail.status }) }), _jsxs("p", { children: ["Placed: ", formatRelativeTime(detail.createdAt)] })] })] }), _jsx("hr", { className: styles.detailDivider }), _jsx("h4", { children: "Items" }), _jsx(Table, { columns: [
                                { key: 'name', header: 'Product', render: (i) => _jsx("strong", { children: i.name }) },
                                { key: 'sku', header: 'SKU', width: '120px' },
                                { key: 'quantity', header: 'Qty', width: '70px', align: 'center' },
                                { key: 'unitPrice', header: 'Unit', width: '100px', align: 'right', render: (i) => formatCurrency(i.unitPrice) },
                                { key: 'lineTotal', header: 'Total', width: '100px', align: 'right', render: (i) => formatCurrency(i.lineTotal) },
                            ], data: detail.items, keyExtractor: (item) => item.id }), _jsxs("div", { className: styles.totals, children: [_jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Subtotal" }), _jsx("span", { children: formatCurrency(detail.subtotal) })] }), _jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Discount" }), _jsx("span", { children: formatCurrency(detail.discount) })] }), _jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Shipping" }), _jsx("span", { children: formatCurrency(detail.shipping) })] }), _jsxs("div", { className: styles.totalRow, children: [_jsx("span", { children: "Tax" }), _jsx("span", { children: formatCurrency(detail.tax) })] }), _jsxs("div", { className: styles.totalRowGrand, children: [_jsx("span", { children: "Grand Total" }), _jsx("span", { children: formatCurrency(detail.total) })] })] }), _jsxs("div", { className: styles.detailFooter, children: [_jsxs("label", { className: styles.statusSelect, children: ["Status", _jsx(Select, { options: Object.keys(STATUS_BADGE).map(k => ({ value: k, label: k })), value: detail.status, onChange: async (e) => {
                                                const v = e.target.value;
                                                await api.orders.update(detail.id, { status: v });
                                                setDetail({ ...detail, status: v });
                                                fetchData();
                                            } })] }), _jsxs("label", { className: styles.statusSelect, children: ["Payment", _jsx(Select, { options: Object.keys(PAYMENT_BADGE).map(k => ({ value: k, label: k })), value: detail.paymentStatus, onChange: async (e) => {
                                                const v = e.target.value;
                                                await api.orders.update(detail.id, { paymentStatus: v });
                                                setDetail({ ...detail, paymentStatus: v });
                                                fetchData();
                                            } })] }), _jsx(Button, { variant: "outline", onClick: () => setDetail(null), children: "Close" })] })] })) })] }));
}
