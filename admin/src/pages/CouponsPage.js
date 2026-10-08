import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Tag } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import styles from './CouponsPage.module.css';
export function CouponsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.coupons.list({ page, limit: 20, search, sort });
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
    useEffect(() => { fetchData(); }, [page, search, sort]);
    const handleCreate = async (formData) => {
        await api.coupons.create(formData);
        setModalOpen(false);
        fetchData();
    };
    const handleUpdate = async (formData) => {
        await api.coupons.update(editing.id, formData);
        setEditing(null);
        setModalOpen(false);
        fetchData();
    };
    const handleDelete = async () => { if (!deleting)
        return; await api.coupons.delete(deleting); setDeleting(null); fetchData(); };
    const openEdit = (c) => { setEditing(c); setModalOpen(true); };
    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const confirmDelete = (id) => setDeleting(id);
    const toggleActive = async (id) => { await api.coupons.toggle(id); fetchData(); };
    const columns = [
        { key: 'code', header: 'Code', width: '130px', render: (c) => _jsx("strong", { children: c.code }) },
        { key: 'description', header: 'Description', render: (c) => c.description || '—' },
        { key: 'discount', header: 'Discount', width: '130px', align: 'center', render: (c) => c.discountType === 'percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue) },
        { key: 'limits', header: 'Limits', width: '140px', render: (c) => {
                const parts = [];
                if (c.minimumOrderValue)
                    parts.push(`Min ₹${c.minimumOrderValue.toLocaleString()}`);
                if (c.minimumQuantity > 1)
                    parts.push(`Min ${c.minimumQuantity} qty`);
                if (c.usageLimit)
                    parts.push(`Max ${c.usageLimit} uses`);
                return parts.join(' · ') || '—';
            } },
        { key: 'validity', header: 'Validity', width: '160px', render: (c) => {
                if (!c.validFrom && !c.validUntil)
                    return 'Always';
                return `${c.validFrom ? formatDate(c.validFrom) : '—'} → ${c.validUntil ? formatDate(c.validUntil) : '—'}`;
            } },
        { key: 'status', header: 'Status', width: '100px', align: 'center', render: (c) => _jsx(Badge, { variant: c.isActive ? (c.isExpired ? 'warning' : c.isExhausted ? 'danger' : 'success') : 'danger', children: c.isActive ? (c.isExpired ? 'Expired' : c.isExhausted ? 'Exhausted' : 'Active') : 'Inactive' }) },
        { key: 'usedCount', header: 'Used', width: '80px', align: 'center', render: (c) => `${c.usedCount}${c.usageLimit ? `/${c.usageLimit}` : ''}` },
        { key: 'actions', header: '', width: '130px', render: (c) => (_jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.iconBtn, onClick: () => openEdit(c), "aria-label": "Edit", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => toggleActive(c.id), "aria-label": c.isActive ? 'Deactivate' : 'Activate', style: { color: c.isActive ? 'var(--color-success)' : 'var(--color-gold)' }, children: _jsx(Tag, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => confirmDelete(c.id), "aria-label": "Delete", children: _jsx(Trash2, { size: 16 }) })] })) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsxs("header", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Coupons" }), _jsx("p", { className: styles.subtitle, children: "Create and manage discount codes" })] }), _jsxs(Button, { variant: "gold", onClick: openCreate, children: [_jsx(Plus, { size: 18 }), " Add Coupon"] })] }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search coupons\u2026", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [
                            { value: '-createdAt', label: 'Newest' },
                            { value: 'createdAt', label: 'Oldest' },
                            { value: 'code', label: 'Code A–Z' },
                        ], value: sort, onChange: e => { setSort(e.target.value); setPage(1); }, className: styles.filterSelect })] }), _jsx(Table, { columns: columns, data: data, keyExtractor: c => c.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No coupons found" }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setEditing(null); }, title: editing ? 'Edit Coupon' : 'Create Coupon', size: "lg", children: _jsx(CouponForm, { initial: editing, onSubmit: editing ? handleUpdate : handleCreate, onCancel: () => { setModalOpen(false); setEditing(null); }, submitting: loading }) }), _jsxs(Modal, { open: !!deleting, onClose: () => setDeleting(null), title: "Delete Coupon", size: "sm", children: [_jsx("p", { children: "Are you sure you want to delete this coupon? This cannot be undone." }), _jsxs("div", { className: styles.modalActions, children: [_jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, children: "Delete" })] })] })] }));
}
function CouponForm({ initial, onSubmit, onCancel, submitting }) {
    const [form, setForm] = useState({
        code: '', description: '', discountType: 'percentage', discountValue: 0, maxDiscountAmount: '',
        minimumOrderValue: 0, minimumQuantity: 1, usageLimit: '', perUserLimit: '',
        validFrom: '', validUntil: '', applicableCategories: [], applicableProducts: [], isActive: true,
    });
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (initial) {
            setForm({
                code: initial.code ?? '', description: initial.description ?? '', discountType: initial.discountType ?? 'percentage',
                discountValue: initial.discountValue ?? 0, maxDiscountAmount: initial.maxDiscountAmount ?? '',
                minimumOrderValue: initial.minimumOrderValue ?? 0, minimumQuantity: initial.minimumQuantity ?? 1,
                usageLimit: initial.usageLimit ?? '', perUserLimit: initial.perUserLimit ?? '',
                validFrom: initial.validFrom ? initial.validFrom.slice(0, 10) : '',
                validUntil: initial.validUntil ? initial.validUntil.slice(0, 10) : '',
                applicableCategories: initial.applicableCategories ?? [], applicableProducts: initial.applicableProducts ?? [],
                isActive: initial.isActive ?? true,
            });
        }
        else {
            setForm({
                code: '', description: '', discountType: 'percentage', discountValue: 0, maxDiscountAmount: '',
                minimumOrderValue: 0, minimumQuantity: 1, usageLimit: '', perUserLimit: '',
                validFrom: '', validUntil: '', applicableCategories: [], applicableProducts: [], isActive: true,
            });
        }
    }, [initial]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? e.target.checked : value }));
        if (errors[name])
            setErrors(prev => ({ ...prev, [name]: '' }));
    };
    const validate = () => {
        const newErrors = {};
        if (!form.code.trim())
            newErrors.code = 'Code is required';
        if (form.discountValue <= 0)
            newErrors.discountValue = 'Must be greater than 0';
        if (form.discountType === 'percentage' && form.discountValue > 100)
            newErrors.discountValue = 'Percentage cannot exceed 100%';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        const payload = {
            ...form,
            code: form.code.trim().toUpperCase(),
            discountValue: Number(form.discountValue),
            maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
            usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
            perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
            validFrom: form.validFrom ? new Date(form.validFrom).getTime() : null,
            validUntil: form.validUntil ? new Date(form.validUntil).getTime() : null,
        };
        await onSubmit(payload);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.grid, children: [_jsx(Input, { label: "Code", name: "code", value: form.code, onChange: handleChange, error: errors.code, placeholder: "e.g. WELCOME10", required: true }), _jsx(Input, { label: "Description", name: "description", value: form.description, onChange: handleChange, placeholder: "Optional" }), _jsx(Select, { label: "Discount Type", name: "discountType", value: form.discountType, onChange: handleChange, options: [
                            { value: 'percentage', label: 'Percentage (%)' },
                            { value: 'fixed', label: 'Fixed Amount (₹)' },
                        ] }), _jsx(Input, { label: "Discount Value", name: "discountValue", type: "number", min: "0", step: form.discountType === 'percentage' ? '1' : '0.01', value: form.discountValue, onChange: handleChange, error: errors.discountValue, placeholder: form.discountType === 'percentage' ? '10' : '500', required: true }), _jsx(Input, { label: "Max Discount (\u20B9)", name: "maxDiscountAmount", type: "number", min: "0", step: "0.01", value: form.maxDiscountAmount, onChange: handleChange, placeholder: "Optional (percentage only)" }), _jsx(Input, { label: "Min Order Value (\u20B9)", name: "minimumOrderValue", type: "number", min: "0", step: "0.01", value: form.minimumOrderValue, onChange: handleChange }), _jsx(Input, { label: "Min Quantity", name: "minimumQuantity", type: "number", min: "1", value: form.minimumQuantity, onChange: handleChange }), _jsx(Input, { label: "Usage Limit", name: "usageLimit", type: "number", min: "1", value: form.usageLimit, onChange: handleChange, placeholder: "Optional" }), _jsx(Input, { label: "Per User Limit", name: "perUserLimit", type: "number", min: "1", value: form.perUserLimit, onChange: handleChange, placeholder: "Optional" }), _jsx(Input, { label: "Valid From", name: "validFrom", type: "date", value: form.validFrom, onChange: handleChange }), _jsx(Input, { label: "Valid Until", name: "validUntil", type: "date", value: form.validUntil, onChange: handleChange }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Applicable Categories" }), _jsx("div", { className: styles.multiSelect, children: _jsx("button", { type: "button", className: styles.chip, onClick: () => setForm(prev => ({ ...prev, applicableCategories: [] })), children: "Clear" }) })] }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Applicable Products" }), _jsx("div", { className: styles.multiSelect, children: _jsx("button", { type: "button", className: styles.chip, onClick: () => setForm(prev => ({ ...prev, applicableProducts: [] })), children: "Clear" }) })] }), _jsx("div", { className: styles.fullWidth, children: _jsxs("label", { className: styles.label, children: [_jsx("input", { type: "checkbox", checked: form.isActive, onChange: e => setForm(prev => ({ ...prev, isActive: e.target.checked })) }), " Active"] }) })] }), _jsxs("div", { className: styles.actions, children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "gold", loading: submitting, children: submitting ? 'Saving…' : (initial ? 'Save Changes' : 'Create Coupon') })] })] }));
}
