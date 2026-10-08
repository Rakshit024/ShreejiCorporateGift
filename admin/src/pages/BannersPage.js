import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Image, Eye, EyeOff } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './BannersPage.module.css';
export function BannersPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('order');
    const [placementFilter, setPlacementFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.banners.list({ page, limit: 20, search, sort, placement: placementFilter, isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined });
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
    useEffect(() => { fetchData(); }, [page, search, sort, placementFilter, activeFilter]);
    const handleCreate = async (formData) => { await api.banners.create(formData); setModalOpen(false); fetchData(); };
    const handleUpdate = async (formData) => { await api.banners.update(editing.id, formData); setEditing(null); setModalOpen(false); fetchData(); };
    const handleDelete = async () => { if (!deleting)
        return; await api.banners.delete(deleting); setDeleting(null); fetchData(); };
    const openEdit = (b) => { setEditing(b); setModalOpen(true); };
    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const confirmDelete = (id) => setDeleting(id);
    const toggleActive = async (id) => { await api.banners.toggle(id); fetchData(); };
    const columns = [
        { key: 'image', header: '', width: '80px', render: (b) => b.image ? _jsx("img", { src: b.image, alt: "", className: styles.thumb }) : _jsx("span", { className: styles.noImage, children: _jsx(Image, { size: 20 }) }) },
        { key: 'title', header: 'Title', render: (b) => _jsx("strong", { children: b.title }) },
        { key: 'placement', header: 'Placement', width: '130px', render: (b) => _jsx(Badge, { variant: "navy", children: b.placement }) },
        { key: 'order', header: 'Order', width: '80px', align: 'center' },
        { key: 'status', header: 'Status', width: '100px', align: 'center', render: (b) => _jsx(Badge, { variant: b.isActive ? 'success' : 'danger', children: b.isActive ? 'Active' : 'Inactive' }) },
        { key: 'schedule', header: 'Schedule', width: '160px', render: (b) => {
                if (!b.startsAt && !b.endsAt)
                    return 'Always';
                return `${b.startsAt ? formatRelativeTime(b.startsAt) : '—'} → ${b.endsAt ? formatRelativeTime(b.endsAt) : '—'}`;
            } },
        { key: 'createdAt', header: 'Created', width: '140px', render: (b) => formatRelativeTime(b.createdAt) },
        { key: 'actions', header: '', width: '130px', render: (b) => (_jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.iconBtn, onClick: () => openEdit(b), "aria-label": "Edit", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => toggleActive(b.id), "aria-label": b.isActive ? 'Deactivate' : 'Activate', style: { color: b.isActive ? 'var(--color-success)' : 'var(--color-gold)' }, children: _jsx(Eye, { size: 16 }) }), _jsx("button", { className: styles.iconBtn, onClick: () => confirmDelete(b.id), "aria-label": "Delete", children: _jsx(Trash2, { size: 16 }) })] })) },
    ];
    return (_jsxs("div", { className: styles.page, children: [_jsxs("header", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { className: styles.title, children: "Banners" }), _jsx("p", { className: styles.subtitle, children: "Manage promotional banners across the site" })] }), _jsxs(Button, { variant: "gold", onClick: openCreate, children: [_jsx(Plus, { size: 18 }), " Add Banner"] })] }), _jsxs("div", { className: styles.toolbar, children: [_jsx(Input, { placeholder: "Search banners\u2026", value: search, onChange: e => { setSearch(e.target.value); setPage(1); }, leftIcon: _jsx(Search, { size: 18 }), className: styles.searchInput }), _jsx(Select, { options: [
                            { value: '', label: 'All Placements' },
                            { value: 'home-hero', label: 'Home Hero' },
                            { value: 'home-mid', label: 'Home Mid' },
                            { value: 'category-top', label: 'Category Top' },
                            { value: 'popup', label: 'Popup' },
                        ], value: placementFilter, onChange: e => { setPlacementFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: '', label: 'All Status' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ], value: activeFilter, onChange: e => { setActiveFilter(e.target.value); setPage(1); }, className: styles.filterSelect }), _jsx(Select, { options: [
                            { value: 'order', label: 'Display Order' },
                            { value: '-createdAt', label: 'Newest' },
                            { value: 'createdAt', label: 'Oldest' },
                        ], value: sort, onChange: e => { setSort(e.target.value); setPage(1); }, className: styles.filterSelect })] }), _jsx(Table, { columns: columns, data: data, keyExtractor: b => b.id, sortBy: sort.replace(/^-/, ''), sortDir: sort.startsWith('-') ? 'desc' : 'asc', onSort: key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`), loading: loading, emptyMessage: "No banners found" }), _jsxs("div", { className: styles.pagination, children: [_jsxs("span", { children: ["Showing ", data.length, " of ", total] }), _jsxs("div", { className: styles.pageBtns, children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page === 1, onClick: () => setPage(p => p - 1), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: page * 20 >= total, onClick: () => setPage(p => p + 1), children: "Next" })] })] }), _jsx(Modal, { open: modalOpen, onClose: () => { setModalOpen(false); setEditing(null); }, title: editing ? 'Edit Banner' : 'Create Banner', size: "lg", children: _jsx(BannerForm, { initial: editing, onSubmit: editing ? handleUpdate : handleCreate, onCancel: () => { setModalOpen(false); setEditing(null); }, submitting: loading }) }), _jsxs(Modal, { open: !!deleting, onClose: () => setDeleting(null), title: "Delete Banner", size: "sm", children: [_jsx("p", { children: "Are you sure you want to delete this banner? This cannot be undone." }), _jsxs("div", { className: styles.modalActions, children: [_jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDelete, children: "Delete" })] })] })] }));
}
function BannerForm({ initial, onSubmit, onCancel, submitting }) {
    const [form, setForm] = useState({
        title: '', subtitle: '', image: '', mobileImage: '', ctaLabel: '', ctaLink: '',
        placement: 'home-hero', order: 0, isActive: true, startsAt: '', endsAt: '',
    });
    const [previewFile, setPreviewFile] = useState(null);
    const [mobileFile, setMobileFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [mobileUrl, setMobileUrl] = useState(null);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (initial) {
            setForm({
                title: initial.title ?? '', subtitle: initial.subtitle ?? '', image: initial.image ?? '',
                mobileImage: initial.mobileImage ?? '', ctaLabel: initial.ctaLabel ?? '', ctaLink: initial.ctaLink ?? '',
                placement: initial.placement ?? 'home-hero', order: initial.order ?? 0, isActive: initial.isActive ?? true,
                startsAt: initial.startsAt ? initial.startsAt.slice(0, 16) : '',
                endsAt: initial.endsAt ? initial.endsAt.slice(0, 16) : '',
            });
            setPreviewUrl(initial.image || null);
            setMobileUrl(initial.mobileImage || null);
        }
        else {
            setForm({
                title: '', subtitle: '', image: '', mobileImage: '', ctaLabel: '', ctaLink: '',
                placement: 'home-hero', order: 0, isActive: true, startsAt: '', endsAt: '',
            });
            setPreviewUrl(null);
            setMobileUrl(null);
        }
    }, [initial]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? e.target.checked : value }));
    };
    const handleImageChange = (e, field) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (field === 'image') {
            setPreviewFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
        else {
            setMobileFile(file);
            setMobileUrl(URL.createObjectURL(file));
        }
    };
    const uploadImage = async (field) => {
        const file = field === 'image' ? previewFile : mobileFile;
        if (!file)
            return;
        try {
            const res = await api.uploads.uploadImage(file);
            const url = res.files[0]?.url ?? '';
            setForm(prev => ({ ...prev, [field]: url }));
            if (field === 'image') {
                setPreviewUrl(url);
                setPreviewFile(null);
            }
            else {
                setMobileUrl(url);
                setMobileFile(null);
            }
        }
        catch {
            setErrors({ [field]: 'Upload failed' });
        }
    };
    const validate = () => {
        const newErrors = {};
        if (!form.title.trim())
            newErrors.title = 'Title is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        if (previewFile)
            await uploadImage('image');
        if (mobileFile)
            await uploadImage('mobileImage');
        const payload = {
            ...form,
            order: Number(form.order),
            startsAt: form.startsAt ? new Date(form.startsAt).getTime() : null,
            endsAt: form.endsAt ? new Date(form.endsAt).getTime() : null,
        };
        await onSubmit(payload);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.grid, children: [_jsx(Input, { label: "Title", name: "title", value: form.title, onChange: handleChange, error: errors.title, required: true, placeholder: "e.g. Summer Sale 2026" }), _jsx(Input, { label: "Subtitle", name: "subtitle", value: form.subtitle, onChange: handleChange, placeholder: "Optional supporting text" }), _jsx(Select, { label: "Placement", name: "placement", value: form.placement, onChange: handleChange, options: [
                            { value: 'home-hero', label: 'Home Hero' },
                            { value: 'home-mid', label: 'Home Mid Section' },
                            { value: 'category-top', label: 'Category Page Top' },
                            { value: 'popup', label: 'Popup Modal' },
                        ] }), _jsx(Input, { label: "Display Order", name: "order", type: "number", min: "0", value: form.order, onChange: handleChange }), _jsxs("div", { className: styles.imageUpload, children: [_jsx("label", { className: styles.label, children: "Main Image" }), _jsx("div", { className: styles.preview, children: previewUrl ? _jsxs(_Fragment, { children: [" ", _jsx("img", { src: previewUrl, alt: "Preview" }), " ", _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => { setForm(prev => ({ ...prev, image: '' })); setPreviewUrl(null); }, "aria-label": "Remove", children: _jsx(EyeOff, { size: 16 }) }), " "] }) : _jsxs("button", { type: "button", className: styles.dropzone, onClick: () => document.getElementById('banner-main')?.click(), children: [_jsx(Image, { size: 24 }), " Upload"] }) }), _jsx("input", { id: "banner-main", type: "file", accept: "image/*", onChange: e => handleImageChange(e, 'image'), className: styles.fileInput }), previewFile && _jsx(Button, { variant: "outline", size: "sm", type: "button", onClick: () => uploadImage('image'), children: "Upload" })] }), _jsxs("div", { className: styles.imageUpload, children: [_jsx("label", { className: styles.label, children: "Mobile Image (optional)" }), _jsx("div", { className: styles.preview, children: mobileUrl ? _jsxs(_Fragment, { children: [" ", _jsx("img", { src: mobileUrl, alt: "Preview" }), " ", _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => { setForm(prev => ({ ...prev, mobileImage: '' })); setMobileUrl(null); }, "aria-label": "Remove", children: _jsx(EyeOff, { size: 16 }) }), " "] }) : _jsxs("button", { type: "button", className: styles.dropzone, onClick: () => document.getElementById('banner-mobile')?.click(), children: [_jsx(Image, { size: 24 }), " Upload"] }) }), _jsx("input", { id: "banner-mobile", type: "file", accept: "image/*", onChange: e => handleImageChange(e, 'mobileImage'), className: styles.fileInput }), mobileFile && _jsx(Button, { variant: "outline", size: "sm", type: "button", onClick: () => uploadImage('mobileImage'), children: "Upload" })] }), _jsx(Input, { label: "CTA Label", name: "ctaLabel", value: form.ctaLabel, onChange: handleChange, placeholder: "e.g. Shop Now" }), _jsx(Input, { label: "CTA Link", name: "ctaLink", value: form.ctaLink, onChange: handleChange, placeholder: "/products or https://..." }), _jsx(Input, { label: "Start Date/Time", name: "startsAt", type: "datetime-local", value: form.startsAt, onChange: handleChange }), _jsx(Input, { label: "End Date/Time", name: "endsAt", type: "datetime-local", value: form.endsAt, onChange: handleChange }), _jsx("div", { className: styles.fullWidth, children: _jsxs("label", { className: styles.label, children: [_jsx("input", { type: "checkbox", checked: form.isActive, onChange: e => setForm(prev => ({ ...prev, isActive: e.target.checked })) }), " Active"] }) })] }), _jsxs("div", { className: styles.actions, children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "gold", loading: submitting, children: submitting ? 'Saving…' : (initial ? 'Save Changes' : 'Create Banner') })] })] }));
}
