import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Image, Loader2, X } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import styles from './CategoryForm.module.css';
const ICONS = [
    'Droplets', 'Coffee', 'PenLine', 'BookOpen', 'Briefcase', 'Lamp', 'Speaker',
    'KeyRound', 'Trophy', 'Gift', 'Package', 'Palette', 'Box', 'ShoppingBag',
    'Users', 'Award', 'Sparkles', 'Star', 'Heart', 'Crown', 'Gem', 'Zap',
];
export function CategoryForm({ initial, onSubmit, onCancel, submitting }) {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        icon: 'Gift',
        image: '',
        order: 0,
        isActive: true,
        seoTitle: '',
        seoDescription: '',
    });
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (initial) {
            setForm({
                name: initial.name ?? '',
                slug: initial.slug ?? '',
                description: initial.description ?? '',
                icon: initial.icon ?? 'Gift',
                image: initial.image ?? '',
                order: initial.order ?? 0,
                isActive: initial.isActive ?? true,
                seoTitle: initial.seoTitle ?? '',
                seoDescription: initial.seoDescription ?? '',
            });
            setPreviewUrl(initial.image || null);
        }
        else {
            setForm({
                name: '', slug: '', description: '', icon: 'Gift', image: '', order: 0, isActive: true, seoTitle: '', seoDescription: '',
            });
            setPreviewUrl(null);
        }
        setPreviewFile(null);
    }, [initial]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? e.target.checked : value }));
        if (errors[name])
            setErrors(prev => ({ ...prev, [name]: '' }));
    };
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };
    const uploadImage = async () => {
        if (!previewFile)
            return;
        setUploading(true);
        try {
            const res = await api.uploads.uploadImage(previewFile);
            const url = res.files[0]?.url ?? '';
            setForm(prev => ({ ...prev, image: url }));
            setPreviewUrl(url);
            setPreviewFile(null);
        }
        catch (e) {
            setErrors({ image: 'Upload failed' });
        }
        finally {
            setUploading(false);
        }
    };
    const removeImage = () => {
        if (form.image && !previewFile) {
            api.uploads.delete(form.image).catch(() => { });
        }
        setForm(prev => ({ ...prev, image: '' }));
        setPreviewUrl(null);
        setPreviewFile(null);
    };
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim())
            newErrors.name = 'Name is required';
        if (!form.slug.trim())
            newErrors.slug = 'Slug is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        const payload = { ...form };
        if (previewFile) {
            await uploadImage();
            if (errors.image)
                return;
        }
        await onSubmit(payload);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.grid, children: [_jsx(Input, { label: "Name", name: "name", value: form.name, onChange: handleChange, error: errors.name, placeholder: "e.g. Bottles & Sippers", required: true }), _jsx(Input, { label: "Slug", name: "slug", value: form.slug, onChange: handleChange, error: errors.slug, placeholder: "auto-generated from name", helperText: "URL-friendly identifier" }), _jsx(Select, { label: "Icon", name: "icon", value: form.icon, onChange: handleChange, options: ICONS.map(i => ({ value: i, label: i })), placeholder: "Select icon" }), _jsxs("div", { className: styles.imageUpload, children: [_jsx("label", { className: styles.label, children: "Image" }), _jsx("div", { className: styles.preview, children: previewUrl ? (_jsxs(_Fragment, { children: [_jsx("img", { src: previewUrl, alt: "Preview" }), _jsx("button", { type: "button", className: styles.removeBtn, onClick: removeImage, "aria-label": "Remove image", children: _jsx(X, { size: 16 }) })] })) : (_jsxs("button", { type: "button", className: styles.dropzone, onClick: () => document.getElementById('cat-image')?.click(), children: [_jsx(Image, { size: 24 }), " Click or drag to upload"] })) }), _jsx("input", { id: "cat-image", type: "file", accept: "image/*", onChange: handleImageChange, className: styles.fileInput, "aria-label": "Category image" }), form.image && !previewFile && (_jsxs("p", { className: styles.currentImage, children: ["Current: ", _jsx("a", { href: form.image, target: "_blank", rel: "noopener", children: form.image })] })), previewFile && !uploading && (_jsx(Button, { variant: "outline", size: "sm", type: "button", onClick: uploadImage, children: "Upload" })), errors.image && _jsx("p", { className: styles.error, children: errors.image })] }), _jsx(Input, { label: "Display Order", name: "order", type: "number", value: form.order, onChange: handleChange, placeholder: "0" }), _jsx(Select, { label: "Status", name: "isActive", value: String(form.isActive), onChange: (e) => setForm(prev => ({ ...prev, isActive: e.target.value === 'true' })), options: [
                            { value: 'true', label: 'Active' },
                            { value: 'false', label: 'Inactive' },
                        ] }), _jsx(Input, { label: "SEO Title", name: "seoTitle", value: form.seoTitle, onChange: handleChange, placeholder: "Optional", maxLength: 70 }), _jsx(Input, { label: "SEO Description", name: "seoDescription", value: form.seoDescription, onChange: handleChange, placeholder: "Optional", maxLength: 180 }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Description" }), _jsx("textarea", { name: "description", value: form.description, onChange: handleChange, rows: 3, className: styles.textarea, placeholder: "Brief description for the storefront" })] })] }), _jsxs("div", { className: styles.actions, children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "gold", loading: submitting, children: submitting ? _jsx(Loader2, { size: 18, className: styles.spinner }) : (initial ? 'Save Changes' : 'Create Category') })] })] }));
}
