import { useState, useEffect } from 'react';
import { Image, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  initial: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
  categories: any[];
}



export function ProductForm({ initial, onSubmit, onCancel, submitting, categories }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '', slug: '', sku: '', categoryId: '', category: '', priceFrom: 0, currency: 'INR' as const,
    description: '', shortDescription: '', image: '', images: [] as string[],
    featured: false, customizable: false, bulkPricing: true, available: true,
    printingOptions: [] as any[], pricingSlabs: [] as any[], specifications: [] as any[], tags: [] as string[],
    stock: 0, lowStockThreshold: 5, minimumOrderQuantity: 1, leadTimeDays: null as number | null,
    metaTitle: '', metaDescription: '',
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'specs' | 'images' | 'seo'>('basic');

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
    } else {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, tags }));
  };

  // Image handling
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setGalleryFiles(prev => [...prev, ...files].slice(0, 10));
    files.forEach(f => setGalleryUrls(prev => [...prev, URL.createObjectURL(f)]));
    e.target.value = '';
  };
  const removeGallery = (idx: number) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== idx));
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
  };
  const removeMainImage = () => {
    if (form.image && !previewFile) {
      api.uploads.delete(form.image).catch(() => {});
    }
    setForm(prev => ({ ...prev, image: '' }));
    setPreviewUrl(null);
    setPreviewFile(null);
  };
  const uploadImage = async () => {
    if (!previewFile) return;
    setUploading(true);
    try {
      const res = await api.uploads.uploadImage(previewFile);
      const url = res.files[0]?.url ?? '';
      setForm(prev => ({ ...prev, image: url }));
      setPreviewUrl(url);
      setPreviewFile(null);
    } catch { setErrors({ image: 'Upload failed' }); }
    finally { setUploading(false); }
  };

  // Repeater helpers
  const addSlab = () => setForm(prev => ({ ...prev, pricingSlabs: [...prev.pricingSlabs, { min: 1, max: 9, price: 0 }] }));
  const removeSlab = (idx: number) => setForm(prev => ({ ...prev, pricingSlabs: prev.pricingSlabs.filter((_, i) => i !== idx) }));
  const updateSlab = (idx: number, field: string, value: string) => setForm(prev => {
    const next = [...prev.pricingSlabs];
    next[idx] = { ...next[idx], [field]: value === '' ? 0 : Number(value) };
    return { ...prev, pricingSlabs: next };
  });

  const addPrintOption = () => setForm(prev => ({ ...prev, printingOptions: [...prev.printingOptions, { id: '', label: '', pricePerUnit: 0 }] }));
  const removePrintOption = (idx: number) => setForm(prev => ({ ...prev, printingOptions: prev.printingOptions.filter((_, i) => i !== idx) }));
  const updatePrintOption = (idx: number, field: string, value: string) => setForm(prev => {
    const next = [...prev.printingOptions];
    next[idx] = { ...next[idx], [field]: field === 'pricePerUnit' ? (value === '' ? 0 : Number(value)) : value };
    return { ...prev, printingOptions: next };
  });

  const addSpec = () => setForm(prev => ({ ...prev, specifications: [...prev.specifications, { label: '', value: '' }] }));
  const removeSpec = (idx: number) => setForm(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }));
  const updateSpec = (idx: number, field: string, value: string) => setForm(prev => {
    const next = [...prev.specifications];
    next[idx] = { ...next[idx], [field]: value };
    return { ...prev, specifications: next };
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    if (!form.categoryId) newErrors.categoryId = 'Category is required';
    if (form.priceFrom < 0) newErrors.priceFrom = 'Price cannot be negative';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (previewFile) {
      await uploadImage();
      if (errors.image) return;
    }
    if (galleryFiles.length) {
      try {
        const res = await api.uploads.uploadImages(galleryFiles);
        const urls = res.files.map(f => f.url);
        setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
        setGalleryFiles([]);
      } catch {
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
  ] as const;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.tabs} role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className={styles.tab + (activeTab === t.id ? ' ' + styles.active : '')}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >{t.label}</button>
        ))}
      </div>

      {activeTab === 'basic' && (
        <div className={styles.grid} role="tabpanel" id="basic-panel">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
          <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} error={errors.slug} placeholder="auto-generated" />
          <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. SCG-STEEL-750" />
          <Select
            label="Category"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
          />
          <Input label="Price From (₹)" name="priceFrom" type="number" min="0" step="0.01" value={form.priceFrom} onChange={handleChange} error={errors.priceFrom} />
          <div className={styles.fullWidth}>
            <label className={styles.label}>Short Description</label>
            <Textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={2} placeholder="Brief summary for cards" maxLength={240} />
          </div>
          <div className={styles.fullWidth}>
            <label className={styles.label}>Description</label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Full product description" maxLength={4000} />
          </div>
          <div className={styles.checkboxRow}>
            <label><input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({...p, featured: e.target.checked}))} /> Featured</label>
            <label><input type="checkbox" checked={form.customizable} onChange={e => setForm(p => ({...p, customizable: e.target.checked}))} /> Customizable</label>
            <label><input type="checkbox" checked={form.bulkPricing} onChange={e => setForm(p => ({...p, bulkPricing: e.target.checked}))} /> Bulk Pricing</label>
            <label><input type="checkbox" checked={form.available} onChange={e => setForm(p => ({...p, available: e.target.checked}))} /> Available</label>
          </div>
          <div className={styles.imageUpload}>
            <label className={styles.label}>Main Image</label>
            <div className={styles.preview}>
              {previewUrl ? (
                <> <img src={previewUrl} alt="Preview" /> <button type="button" className={styles.removeBtn} onClick={removeMainImage} aria-label="Remove"><X size={16} /></button> </>
              ) : (
                <button type="button" className={styles.dropzone} onClick={() => document.getElementById('prod-main')?.click()}>
                  <Image size={24} /> Click or drag to upload
                </button>
              )}
            </div>
            <input id="prod-main" type="file" accept="image/*" onChange={handleMainImageChange} className={styles.fileInput} />
            {previewFile && !uploading && <Button variant="outline" size="sm" type="button" onClick={uploadImage}>Upload</Button>}
            {errors.image && <p className={styles.error}>{errors.image}</p>}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className={styles.grid} role="tabpanel" id="pricing-panel">
          <div className={styles.fullWidth}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className={styles.subLabel}>Printing Options</span>
              <Button variant="ghost" size="sm" type="button" onClick={addPrintOption}><Plus size={16} /> Add</Button>
            </div>
            {form.printingOptions.map((opt, i) => (
              <div key={i} className={styles.repeaterRow}>
                <Input name={`po-${i}-id`} value={opt.id} onChange={e => updatePrintOption(i, 'id', e.target.value)} placeholder="id (e.g. 1-colour)" style={{ width: '120px' }} />
                <Input name={`po-${i}-label`} value={opt.label} onChange={e => updatePrintOption(i, 'label', e.target.value)} placeholder="Label" style={{ flex: 1 }} />
                <Input name={`po-${i}-price`} type="number" step="0.01" min="0" value={opt.pricePerUnit} onChange={e => updatePrintOption(i, 'pricePerUnit', e.target.value)} placeholder="₹/unit" style={{ width: '100px' }} />
                <button type="button" className={styles.removeBtn} onClick={() => removePrintOption(i)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className={styles.fullWidth}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className={styles.subLabel}>Bulk Pricing Slabs</span>
              <Button variant="ghost" size="sm" type="button" onClick={addSlab}><Plus size={16} /> Add</Button>
            </div>
            {form.pricingSlabs.map((slab, i) => (
              <div key={i} className={styles.repeaterRow}>
                <Input type="number" min="1" value={slab.min} onChange={e => updateSlab(i, 'min', e.target.value)} placeholder="Min" style={{ width: '80px' }} />
                <Input type="number" min="1" value={slab.max === 1000000 ? '' : slab.max} onChange={e => updateSlab(i, 'max', e.target.value === '' ? '1000000' : e.target.value)} placeholder="Max (∞)" style={{ width: '80px' }} />
                <Input type="number" step="0.01" min="0" value={slab.price} onChange={e => updateSlab(i, 'price', e.target.value)} placeholder="Price" style={{ width: '100px' }} />
                <button type="button" className={styles.removeBtn} onClick={() => removeSlab(i)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className={styles.checkboxRow}>
            <label><input type="checkbox" checked={form.customizable} onChange={e => setForm(p => ({...p, customizable: e.target.checked}))} /> Enable printing options</label>
            <label><input type="checkbox" checked={form.bulkPricing} onChange={e => setForm(p => ({...p, bulkPricing: e.target.checked}))} /> Enable bulk slabs</label>
          </div>
        </div>
      )}

      {activeTab === 'specs' && (
        <div className={styles.grid} role="tabpanel" id="specs-panel">
          <div className={styles.fullWidth}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className={styles.subLabel}>Specifications</span>
              <Button variant="ghost" size="sm" type="button" onClick={addSpec}><Plus size={16} /> Add</Button>
            </div>
            {form.specifications.map((spec, i) => (
              <div key={i} className={styles.repeaterRow}>
                <Input name={`spec-${i}-label`} value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)} placeholder="Label (e.g. Material)" style={{ flex: 1 }} />
                <Input name={`spec-${i}-value`} value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Value (e.g. Stainless steel)" style={{ flex: 1 }} />
                <button type="button" className={styles.removeBtn} onClick={() => removeSpec(i)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <Input label="Tags (comma-separated)" name="tags" value={form.tags.join(', ')} onChange={handleTagsChange} placeholder="bottle, steel, branding" />
        </div>
      )}

      {activeTab === 'images' && (
        <div className={styles.grid} role="tabpanel" id="images-panel">
          <div className={styles.imageUpload}>
            <label className={styles.label}>Gallery Images (max 10)</label>
            <div className={styles.gallery}>
              {galleryUrls.map((url, i) => (
                <div key={i} className={styles.galleryItem}>
                  <img src={url} alt={`Gallery ${i + 1}`} />
                  <button type="button" className={styles.removeBtn} onClick={() => removeGallery(i)} aria-label="Remove"><X size={16} /></button>
                </div>
              ))}
              <button type="button" className={styles.dropzone} onClick={() => document.getElementById('prod-gallery')?.click()}>
                <Image size={24} /> Add images
              </button>
            </div>
            <input id="prod-gallery" type="file" accept="image/*" multiple onChange={handleGalleryChange} className={styles.fileInput} />
          </div>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className={styles.grid} role="tabpanel" id="seo-panel">
          <Input label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} maxLength={70} placeholder="Optional" />
          <Input label="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} maxLength={180} placeholder="Optional" />
        </div>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" loading={submitting}>
          {submitting ? <Loader2 size={18} className={styles.spinner} /> : (initial ? 'Save Changes' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
}