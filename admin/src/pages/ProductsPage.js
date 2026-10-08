import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { ProductForm } from '../components/forms/ProductForm';
import styles from './ProductsPage.module.css';
export function ProductsPage() {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [featureIds, setFeatureIds] = useState([]);
    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, cats] = await Promise.all([
                api.products.list({ page, limit: 20, search, sort, categoryId: categoryFilter, stock: stockFilter }),
                api.categories.options(),
            ]);
            setData(res.items);
            setCategories(cats.items);
            setTotal(res.total);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, [page, search, sort, categoryFilter, stockFilter]);
    const handleCreate = async (formData) => {
        await api.products.create(formData);
        setModalOpen(false);
        fetchData();
    };
    const handleUpdate = async (formData) => {
        await api.products.update(editing.id, formData);
        setEditing(null);
        setModalOpen(false);
        fetchData();
    };
    const handleDelete = async () => {
        if (!deleting)
            return;
        await api.products.delete(deleting);
        setDeleting(null);
        fetchData();
    };
    const openEdit = (p) => { setEditing(p); setModalOpen(true); };
    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const confirmDelete = (id) => setDeleting(id);
    const toggleFeatured = async (id) => { await api.products.toggleFeatured(id); fetchData(); };
    const toggleAvailable = async (id) => { await api.products.toggleAvailability(id); fetchData(); };
    const duplicate = async (id) => { await api.products.duplicate(id); fetchData(); };
    const bulkAction = async (action) => {
        if (!featureIds.length)
            return;
        await api.products.bulkAction(featureIds, action);
        setFeatureIds([]);
        fetchData();
    };
    const columns = [
        { key: 'image', header: '', width: '50px', render: (p) => p.image ? _jsx("img", { src: p.image, alt: "", className: styles.thumb }) : _jsx("span", { className: styles.noImage, children: _jsx(Tag, { size: 16 }) }) },
        { key: 'name', header: 'Product', render: (p) => _jsx("strong", { children: p.name }) },
        { key: 'sku', header: 'SKU', width: '100px' },
        { key: 'category', header: 'Category', width: '140px' },
        { key: 'priceFrom', header: 'Price', width: '100px', align: 'right', render: (p) => `₹${p.priceFrom.toLocaleString()}` },
        { key: 'stock', header: 'Stock', width: '90px', align: 'center', render: (p) => _jsx(Badge, { variant: p.stock === 0 ? 'danger' : p.stock <= (p.lowStockThreshold ?? 5) ? 'warning' : 'success', children: p.stock }) },
        { key: 'badges', header: '', width: '130px', render: (p) => (_jsxs("div", { className: styles.badgeRow, children: [p.customizable && _jsx("span", { title: "Customizable product", children: _jsx(Badge, { variant: "navy", children: "Custom" }) }), p.bulkPricing && _jsx("span", { title: "Bulk pricing available", children: _jsx(Badge, { variant: "outline", children: "Bulk" }) }), !p.available && _jsx("span", { title: "Product is not available", children: _jsx(Badge, { variant: "danger", children: "Inactive" }) })] })) },
        { key: 'actions', header: '', width: '160px', render: (p) => (_jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.iconBtn, onClick: () => openEdit(p), "aria-label": "Edit", title: "Edit product", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => duplicate(p.id), "aria-label": "Duplicate", title: "Duplicate product", children: _jsx(Tag, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => toggleFeatured(p.id), "aria-label": p.featured ? 'Remove from featured' : 'Mark as featured', title: p.featured ? 'Featured (click to remove)' : 'Not featured (click to feature)', style: { color: p.featured ? 'var(--color-gold)' : 'var(--color-text-muted)' }, children: _jsx(Badge, { variant: p.featured ? 'gold' : 'outline', children: p.featured ? '★' : '☆' }) }), _jsx("button", { className: styles.iconBtn, onClick: () => toggleAvailable(p.id), "aria-label": p.available ? 'Disable product' : 'Enable product', title: p.available ? 'Active (click to disable)' : 'Inactive (click to enable)', style: { color: p.available ? 'var(--color-success)' : 'var(--color-danger)' }, children: _jsx(Badge, { variant: p.available ? 'success' : 'danger', children: p.available ? 'Active' : 'Inactive' }) }), _jsx("button", { className: styles.iconBtn, onClick: () => confirmDelete(p.id), "aria-label": "Delete", title: "Delete product", children: _jsx(Trash2, { size: 16 }) })] })) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsxs("header", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Products" }), _jsx("p", { className: styles.subtitle, children: "Manage your corporate gift catalog" })] }), _jsxs(Button, { variant: "gold", onClick: openCreate, children: [_jsx(Plus, { size: 18 }), " Add Product"] })] }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search products\u2026", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))], value: categoryFilter, onChange: e => { setCategoryFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: 'all', label: 'All Stock' },
                            { value: 'low', label: 'Low Stock' },
                            { value: 'out', label: 'Out of Stock' },
                        ], value: stockFilter, onChange: e => { setStockFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: '-createdAt', label: 'Newest' },
                            { value: 'createdAt', label: 'Oldest' },
                            { value: 'name', label: 'Name A–Z' },
                            { value: '-name', label: 'Name Z–A' },
                            { value: 'priceFrom', label: 'Price ↑' },
                            { value: '-priceFrom', label: 'Price ↓' },
                        ], value: sort, onChange: e => { setSort(e.target.value); setPage(1); }, className: styles.filterSelect })] }), featureIds.length > 0 && (_jsxs("div", { className: styles.bulkBar, children: [_jsxs("span", { children: [featureIds.length, " selected"] }), _jsxs("div", { className: styles.bulkActions, children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => bulkAction('feature'), children: "Feature" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => bulkAction('unfeature'), children: "Unfeature" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => bulkAction('available'), children: "Enable" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => bulkAction('unavailable'), children: "Disable" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setFeatureIds([]), children: "Clear" })] })] })), _jsx(Table, { columns: columns, data: data, keyExtractor: (p) => p.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No products found", onRowClick: p => { setFeatureIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]); } }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setEditing(null); }, title: editing ? 'Edit Product' : 'Add Product', size: "xl", children: _jsx(ProductForm, { initial: editing, onSubmit: editing ? handleUpdate : handleCreate, onCancel: () => { setModalOpen(false); setEditing(null); }, submitting: loading, categories: categories }) }), _jsxs(Modal, { open: !!deleting, onClose: () => setDeleting(null), title: "Delete Product", size: "sm", children: [_jsx("p", { children: "Are you sure you want to delete this product? This cannot be undone." }), _jsxs("div", { className: styles.modalActions, children: [_jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, children: "Delete" })] })] })] }));
}
