import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { CategoryForm } from '../components/forms/CategoryForm';
import styles from './CategoriesPage.module.css';
export function CategoriesPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-order');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.categories.list({ page, limit: 20, search, sort, isActive: true });
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
        await api.categories.create(formData);
        setModalOpen(false);
        fetchData();
    };
    const handleUpdate = async (formData) => {
        await api.categories.update(editing.id, formData);
        setEditing(null);
        setModalOpen(false);
        fetchData();
    };
    const handleDelete = async () => {
        if (!deleting)
            return;
        await api.categories.delete(deleting);
        setDeleting(null);
        fetchData();
    };
    const openEdit = (cat) => { setEditing(cat); setModalOpen(true); };
    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const confirmDelete = (id) => setDeleting(id);
    const reorder = async (id, direction) => {
        const idx = data.findIndex((c) => c.id === id);
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= data.length)
            return;
        const newOrder = [...data];
        [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
        const ids = newOrder.map((c) => c.id);
        await api.categories.reorder(ids);
        fetchData();
    };
    const columns = [
        { key: 'order', header: '', width: '50px', render: (c, i) => (_jsxs("div", { className: styles.orderCell, children: [_jsx("span", { children: c.order ?? i + 1 }), _jsx("button", { className: styles.orderBtn, onClick: () => reorder(c.id, 'up'), "aria-label": "Move up", children: _jsx(ArrowUp, { size: 12 }) }), _jsx("button", { className: styles.orderBtn, onClick: () => reorder(c.id, 'down'), "aria-label": "Move down", children: _jsx(ArrowDown, { size: 12 }) })] })) },
        { key: 'image', header: '', width: '50px', render: (c) => c.image ? _jsx("img", { src: c.image, alt: "", className: styles.thumb }) : _jsx("span", { className: styles.noImage, children: _jsx(ImageIcon, { size: 16 }) }) },
        { key: 'icon', header: '', width: '50px', render: (c) => _jsx("span", { className: styles.iconBadge, "aria-label": c.icon, children: c.icon }) },
        { key: 'name', header: 'Name', render: (c) => _jsx("strong", { children: c.name }) },
        { key: 'slug', header: 'Slug', width: '160px' },
        { key: 'productCount', header: 'Products', width: '90px', align: 'center', render: (c) => _jsx(Badge, { variant: "navy", children: c.productCount ?? 0 }) },
        { key: 'isActive', header: 'Status', width: '100px', align: 'center', render: (c) => (_jsx(Badge, { variant: c.isActive ? 'success' : 'outline', children: c.isActive ? 'Active' : 'Inactive' })) },
        { key: 'actions', header: '', width: '130px', render: (c) => (_jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.iconBtn, onClick: () => openEdit(c), "aria-label": "Edit", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => confirmDelete(c.id), "aria-label": "Delete", children: _jsx(Trash2, { size: 16 }) })] })) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsxs("header", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Categories" }), _jsx("p", { className: styles.subtitle, children: "Manage product categories and their display order" })] }), _jsxs(Button, { variant: "gold", onClick: openCreate, children: [_jsx(Plus, { size: 18 }), " Add Category"] })] }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search categories\u2026", value: search, onChange: (e) => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [
                            { value: '-order', label: 'Order (default)' },
                            { value: 'name', label: 'Name A–Z' },
                            { value: '-name', label: 'Name Z–A' },
                            { value: '-createdAt', label: 'Newest' },
                        ], value: sort, onChange: (e) => { setSort(e.target.value); setPage(1); }, className: styles.sortSelect })] }), _jsx(Table, { columns: columns, data: data, keyExtractor: (c) => c.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: (key) => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No categories found" }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setEditing(null); }, title: editing ? 'Edit Category' : 'Add Category', size: "lg", children: _jsx(CategoryForm, { initial: editing, onSubmit: editing ? handleUpdate : handleCreate, onCancel: () => { setModalOpen(false); setEditing(null); }, submitting: loading }) }), _jsxs(Modal, { open: !!deleting, onClose: () => setDeleting(null), title: "Delete Category", size: "sm", children: [_jsx("p", { children: "Are you sure you want to delete this category? This cannot be undone." }), _jsxs("div", { className: styles.modalActions, children: [_jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, children: "Delete" })] })] })] }));
}
