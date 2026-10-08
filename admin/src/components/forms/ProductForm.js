import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Image, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import styles from './ProductForm.module.css';
export function ProductForm({ initial, onSubmit, onCancel, submitting, categories }) {
    const [form, setForm] = useState({
        name: '', slug: '', sku: '', categoryId: '', category: '', priceFrom: 0, currency: 'INR',
        description: '', shortDescription: '', image: '', images: [],
        featured: false, customizable: false, bulkPricing: true, available: true,
        printingOptions: [], pricingSlabs: [], specifications: [], tags: [],
        stock: 0, lowStockThreshold: 5, minimumOrderQuantity: 1, leadTimeDays: null,
        metaTitle: '', metaDescription: '',
    });
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryUrls, setGalleryUrls] = useState([]);
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    useEffect(() => {
        if (initial) {
            setForm({
                name: initial.name ?? '',
                slug: initial.slug ?? '',
                sku: initial.sku ?? '',
                categoryId: initial.categoryId ?? '',
                category: initial.category ?? '',
                priceFrom: initial.priceFrom ?? 0,
                currency: initial.currency ?? 'INR',
                description: initial.description ?? '',
                shortDescription: initial.shortDescription ?? '',
                image: initial.image ?? '',
                images: initial.images ?? [],
                featured: initial.featured ?? false,
                customizable: initial.customizable ?? false,
                bulkPricing: initial.bulkPricing ?? true,
                available: initial.available ?? true,
                printingOptions: initial.printingOptions ?? [],
                pricingSlabs: initial.pricingSlabs ?? [],
                specifications: initial.specifications ?? [],
                tags: initial.tags ?? [],
                stock: initial.stock ?? 0,
                lowStockThreshold: initial.lowStockThreshold ?? 5,
                minimumOrderQuantity: initial.minimumOrderQuantity ?? 1,
                leadTimeDays: initial.leadTimeDays ?? null,
                metaTitle: initial.metaTitle ?? '',
                metaDescription: initial.metaDescription ?? '',
            });
            setGalleryUrls(initial.images ?? []);
            setPreviewUrl(initial.image || null);
        }
        else {
            setForm({
                name: '', slug: '', sku: '', categoryId: '', category: '', priceFrom: 0, currency: 'INR',
                description: '', shortDescription: '', image: '', images: [],
                featured: false, customizable: false, bulkPricing: true, available: true,
                printingOptions: [], pricingSlabs: [], specifications: [], tags: [],
                stock: 0, lowStockThreshold: 5, minimumOrderQuantity: 1, leadTimeDays: null,
                metaTitle: '', metaDescription: '',
            });
            setGalleryUrls([]);
            setPreviewUrl(null);
        }
        setPreviewFile(null);
        setGalleryFiles([]);
    }, [initial]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? e.target.checked : value }));
        if (errors[name])
            setErrors(prev => ({ ...prev, [name]: '' }));
    };
    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
        setForm(prev => ({ ...prev, tags }));
    };
    // Image handling
    const handleMainImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        setGalleryFiles(prev => [...prev, ...files].slice(0, 10));
        files.forEach(f => setGalleryUrls(prev => [...prev, URL.createObjectURL(f)]));
        e.target.value = '';
    };
    const removeGallery = (idx) => {
        setGalleryUrls(prev => prev.filter((_, i) => i !== idx));
        setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    };
    const removeMainImage = () => {
        if (form.image && !previewFile) {
            api.uploads.delete(form.image).catch(() => { });
        }
        setForm(prev => ({ ...prev, image: '' }));
        setPreviewUrl(null);
        setPreviewFile(null);
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
        catch {
            setErrors({ image: 'Upload failed' });
        }
        finally {
            setUploading(false);
        }
    };
    // Repeater helpers
    const addSlab = () => setForm(prev => ({ ...prev, pricingSlabs: [...prev.pricingSlabs, { min: 1, max: 9, price: 0 }] }));
    const removeSlab = (idx) => setForm(prev => ({ ...prev, pricingSlabs: prev.pricingSlabs.filter((_, i) => i !== idx) }));
    const updateSlab = (idx, field, value) => setForm(prev => {
        const next = [...prev.pricingSlabs];
        next[idx] = { ...next[idx], [field]: value === '' ? 0 : Number(value) };
        return { ...prev, pricingSlabs: next };
    });
    const addPrintOption = () => setForm(prev => ({ ...prev, printingOptions: [...prev.printingOptions, { id: '', label: '', pricePerUnit: 0 }] }));
    const removePrintOption = (idx) => setForm(prev => ({ ...prev, printingOptions: prev.printingOptions.filter((_, i) => i !== idx) }));
    const updatePrintOption = (idx, field, value) => setForm(prev => {
        const next = [...prev.printingOptions];
        next[idx] = { ...next[idx], [field]: field === 'pricePerUnit' ? (value === '' ? 0 : Number(value)) : value };
        return { ...prev, printingOptions: next };
    });
    const addSpec = () => setForm(prev => ({ ...prev, specifications: [...prev.specifications, { label: '', value: '' }] }));
    const removeSpec = (idx) => setForm(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }));
    const updateSpec = (idx, field, value) => setForm(prev => {
        const next = [...prev.specifications];
        next[idx] = { ...next[idx], [field]: value };
        return { ...prev, specifications: next };
    });
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim())
            newErrors.name = 'Name is required';
        if (!form.slug.trim())
            newErrors.slug = 'Slug is required';
        if (!form.categoryId)
            newErrors.categoryId = 'Category is required';
        if (form.priceFrom < 0)
            newErrors.priceFrom = 'Price cannot be negative';
        if (form.pricingSlabs.length > 1) {
            for (let i = 1; i < form.pricingSlabs.length; i++) {
                if (form.pricingSlabs[i].min <= form.pricingSlabs[i - 1].min) {
                    newErrors.pricingSlabs = 'Slabs must be ordered by ascending minimum quantity';
                    break;
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        if (previewFile) {
            await uploadImage();
            if (errors.image)
                return;
        }
        if (galleryFiles.length) {
            try {
                const res = await api.uploads.uploadImages(galleryFiles);
                const urls = res.files.map(f => f.url);
                setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                setGalleryFiles([]);
            }
            catch {
                setErrors({ images: 'Gallery upload failed' });
                return;
            }
        }
        const payload = {
            ...form,
            images: form.images,
            printingOptions: form.customizable ? form.printingOptions : [],
            pricingSlabs: form.bulkPricing ? form.pricingSlabs : [],
        };
        await onSubmit(payload);
    };
    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'specs', label: 'Specifications' },
        { id: 'images', label: 'Images' },
        { id: 'seo', label: 'SEO' },
    ];
    return (_jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsx("div", { className: styles.tabs, role: "tablist", children: tabs.map(t => (_jsx("button", { type: "button", role: "tab", "aria-selected": activeTab === t.id, className: styles.tab + (activeTab === t.id ? ' ' + styles.active : ''), onClick: () => setActiveTab(t.id), children: t.label }, t.id))) }), activeTab === 'basic' && (_jsxs("div", { className: styles.grid, role: "tabpanel", id: "basic-panel", children: [_jsx(Input, { label: "Name", name: "name", value: form.name, onChange: handleChange, error: errors.name, required: true }), _jsx(Input, { label: "Slug", name: "slug", value: form.slug, onChange: handleChange, error: errors.slug, placeholder: "auto-generated" }), _jsx(Input, { label: "SKU", name: "sku", value: form.sku, onChange: handleChange, placeholder: "e.g. SCG-STEEL-750" }), _jsx(Select, { label: "Category", name: "categoryId", value: form.categoryId, onChange: handleChange, options: categories.map(c => ({ value: c.id, label: c.name })), placeholder: "Select category" }), _jsx(Input, { label: "Price From (\u20B9)", name: "priceFrom", type: "number", min: "0", step: "0.01", value: form.priceFrom, onChange: handleChange, error: errors.priceFrom }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Short Description" }), _jsx(Textarea, { name: "shortDescription", value: form.shortDescription, onChange: handleChange, rows: 2, placeholder: "Brief summary for cards", maxLength: 240 })] }), _jsxs("div", { className: styles.fullWidth, children: [_jsx("label", { className: styles.label, children: "Description" }), _jsx(Textarea, { name: "description", value: form.description, onChange: handleChange, rows: 4, placeholder: "Full product description", maxLength: 4000 })] }), _jsxs("div", { className: styles.checkboxRow, children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: form.featured, onChange: e => setForm(p => ({ ...p, featured: e.target.checked })) }), " Featured"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: form.customizable, onChange: e => setForm(p => ({ ...p, customizable: e.target.checked })) }), " Customizable"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: form.bulkPricing, onChange: e => setForm(p => ({ ...p, bulkPricing: e.target.checked })) }), " Bulk Pricing"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: form.available, onChange: e => setForm(p => ({ ...p, available: e.target.checked })) }), " Available"] })] }), _jsxs("div", { className: styles.imageUpload, children: [_jsx("label", { className: styles.label, children: "Main Image" }), _jsx("div", { className: styles.preview, children: previewUrl ? (_jsxs(_Fragment, { children: [" ", _jsx("img", { src: previewUrl, alt: "Preview" }), " ", _jsx("button", { type: "button", className: styles.removeBtn, onClick: removeMainImage, "aria-label": "Remove", children: _jsx(X, { size: 16 }) }), " "] })) : (_jsxs("button", { type: "button", className: styles.dropzone, onClick: () => document.getElementById('prod-main')?.click(), children: [_jsx(Image, { size: 24 }), " Click or drag to upload"] })) }), _jsx("input", { id: "prod-main", type: "file", accept: "image/*", onChange: handleMainImageChange, className: styles.fileInput }), previewFile && !uploading && _jsx(Button, { variant: "outline", size: "sm", type: "button", onClick: uploadImage, children: "Upload" }), errors.image && _jsx("p", { className: styles.error, children: errors.image })] })] })), activeTab === 'pricing' && (_jsxs("div", { className: styles.grid, role: "tabpanel", id: "pricing-panel", children: [_jsxs("div", { className: styles.fullWidth, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: [_jsx("span", { className: styles.subLabel, children: "Printing Options" }), _jsxs(Button, { variant: "ghost", size: "sm", type: "button", onClick: addPrintOption, children: [_jsx(Plus, { size: 16 }), " Add"] })] }), form.printingOptions.map((opt, i) => (_jsxs("div", { className: styles.repeaterRow, children: [_jsx(Input, { name: `po-${i}-id`, value: opt.id, onChange: e => updatePrintOption(i, 'id', e.target.value), placeholder: "id (e.g. 1-colour)", style: { width: '120px' } }), _jsx(Input, { name: `po-${i}-label`, value: opt.label, onChange: e => updatePrintOption(i, 'label', e.target.value), placeholder: "Label", style: { flex: 1 } }), _jsx(Input, { name: `po-${i}-price`, type: "number", step: "0.01", min: "0", value: opt.pricePerUnit, onChange: e => updatePrintOption(i, 'pricePerUnit', e.target.value), placeholder: "\u20B9/unit", style: { width: '100px' } }), _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => removePrintOption(i), "aria-label": "Remove", children: _jsx(Trash2, { size: 16 }) })] }, i)))] }), _jsxs("div", { className: styles.fullWidth, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: [_jsx("span", { className: styles.subLabel, children: "Bulk Pricing Slabs" }), _jsxs(Button, { variant: "ghost", size: "sm", type: "button", onClick: addSlab, children: [_jsx(Plus, { size: 16 }), " Add"] })] }), form.pricingSlabs.map((slab, i) => (_jsxs("div", { className: styles.repeaterRow, children: [_jsx(Input, { type: "number", min: "1", value: slab.min, onChange: e => updateSlab(i, 'min', e.target.value), placeholder: "Min", style: { width: '80px' } }), _jsx(Input, { type: "number", min: "1", value: slab.max === 1000000 ? '' : slab.max, onChange: e => updateSlab(i, 'max', e.target.value === '' ? '1000000' : e.target.value), placeholder: "Max (\u221E)", style: { width: '80px' } }), _jsx(Input, { type: "number", step: "0.01", min: "0", value: slab.price, onChange: e => updateSlab(i, 'price', e.target.value), placeholder: "Price", style: { width: '100px' } }), _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => removeSlab(i), "aria-label": "Remove", children: _jsx(Trash2, { size: 16 }) })] }, i)))] }), _jsxs("div", { className: styles.checkboxRow, children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: form.customizable, onChange: e => setForm(p => ({ ...p, customizable: e.target.checked })) }), " Enable printing options"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: form.bulkPricing, onChange: e => setForm(p => ({ ...p, bulkPricing: e.target.checked })) }), " Enable bulk slabs"] })] })] })), activeTab === 'specs' && (_jsxs("div", { className: styles.grid, role: "tabpanel", id: "specs-panel", children: [_jsxs("div", { className: styles.fullWidth, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: [_jsx("span", { className: styles.subLabel, children: "Specifications" }), _jsxs(Button, { variant: "ghost", size: "sm", type: "button", onClick: addSpec, children: [_jsx(Plus, { size: 16 }), " Add"] })] }), form.specifications.map((spec, i) => (_jsxs("div", { className: styles.repeaterRow, children: [_jsx(Input, { name: `spec-${i}-label`, value: spec.label, onChange: e => updateSpec(i, 'label', e.target.value), placeholder: "Label (e.g. Material)", style: { flex: 1 } }), _jsx(Input, { name: `spec-${i}-value`, value: spec.value, onChange: e => updateSpec(i, 'value', e.target.value), placeholder: "Value (e.g. Stainless steel)", style: { flex: 1 } }), _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => removeSpec(i), "aria-label": "Remove", children: _jsx(Trash2, { size: 16 }) })] }, i)))] }), _jsx(Input, { label: "Tags (comma-separated)", name: "tags", value: form.tags.join(', '), onChange: handleTagsChange, placeholder: "bottle, steel, branding" })] })), activeTab === 'images' && (_jsx("div", { className: styles.grid, role: "tabpanel", id: "images-panel", children: _jsxs("div", { className: styles.imageUpload, children: [_jsx("label", { className: styles.label, children: "Gallery Images (max 10)" }), _jsxs("div", { className: styles.gallery, children: [galleryUrls.map((url, i) => (_jsxs("div", { className: styles.galleryItem, children: [_jsx("img", { src: url, alt: `Gallery ${i + 1}` }), _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => removeGallery(i), "aria-label": "Remove", children: _jsx(X, { size: 16 }) })] }, i))), _jsxs("button", { type: "button", className: styles.dropzone, onClick: () => document.getElementById('prod-gallery')?.click(), children: [_jsx(Image, { size: 24 }), " Add images"] })] }), _jsx("input", { id: "prod-gallery", type: "file", accept: "image/*", multiple: true, onChange: handleGalleryChange, className: styles.fileInput })] }) })), activeTab === 'seo' && (_jsxs("div", { className: styles.grid, role: "tabpanel", id: "seo-panel", children: [_jsx(Input, { label: "Meta Title", name: "metaTitle", value: form.metaTitle, onChange: handleChange, maxLength: 70, placeholder: "Optional" }), _jsx(Input, { label: "Meta Description", name: "metaDescription", value: form.metaDescription, onChange: handleChange, maxLength: 180, placeholder: "Optional" })] })), _jsxs("div", { className: styles.actions, children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "gold", loading: submitting, children: submitting ? _jsx(Loader2, { size: 18, className: styles.spinner }) : (initial ? 'Save Changes' : 'Create Product') })] })] }));
}
