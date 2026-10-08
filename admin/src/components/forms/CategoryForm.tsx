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
] as const;

interface CategoryFormProps {
  initial: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function CategoryForm({ initial, onSubmit, onCancel, submitting }: CategoryFormProps) {
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else {
      setForm({
        name: '', slug: '', description: '', icon: 'Gift', image: '', order: 0, isActive: true, seoTitle: '', seoDescription: '',
      });
      setPreviewUrl(null);
    }
    setPreviewFile(null);
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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
    } catch (e) {
      setErrors({ image: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (form.image && !previewFile) {
      api.uploads.delete(form.image).catch(() => {});
    }
    setForm(prev => ({ ...prev, image: '' }));
    setPreviewUrl(null);
    setPreviewFile(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (previewFile) {
      await uploadImage();
      if (errors.image) return;
    }
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g. Bottles & Sippers"
          required
        />
        <Input
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          error={errors.slug}
          placeholder="auto-generated from name"
          helperText="URL-friendly identifier"
        />
        <Select
          label="Icon"
          name="icon"
          value={form.icon}
          onChange={handleChange}
          options={ICONS.map(i => ({ value: i, label: i }))}
          placeholder="Select icon"
        />
        <div className={styles.imageUpload}>
          <label className={styles.label}>Image</label>
          <div className={styles.preview}>
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" />
                <button type="button" className={styles.removeBtn} onClick={removeImage} aria-label="Remove image"><X size={16} /></button>
              </>
            ) : (
              <button type="button" className={styles.dropzone} onClick={() => document.getElementById('cat-image')?.click()}>
                <Image size={24} /> Click or drag to upload
              </button>
            )}
          </div>
          <input
            id="cat-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
            aria-label="Category image"
          />
          {form.image && !previewFile && (
            <p className={styles.currentImage}>Current: <a href={form.image} target="_blank" rel="noopener">{form.image}</a></p>
          )}
          {previewFile && !uploading && (
            <Button variant="outline" size="sm" type="button" onClick={uploadImage}>Upload</Button>
          )}
          {errors.image && <p className={styles.error}>{errors.image}</p>}
        </div>
        <Input
          label="Display Order"
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
          placeholder="0"
        />
        <Select
          label="Status"
          name="isActive"
          value={String(form.isActive)}
          onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
        />
        <Input
          label="SEO Title"
          name="seoTitle"
          value={form.seoTitle}
          onChange={handleChange}
          placeholder="Optional"
          maxLength={70}
        />
        <Input
          label="SEO Description"
          name="seoDescription"
          value={form.seoDescription}
          onChange={handleChange}
          placeholder="Optional"
          maxLength={180}
        />
        <div className={styles.fullWidth}>
          <label className={styles.label}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={styles.textarea}
            placeholder="Brief description for the storefront"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" loading={submitting}>
          {submitting ? <Loader2 size={18} className={styles.spinner} /> : (initial ? 'Save Changes' : 'Create Category')}
        </Button>
      </div>
    </form>
  );
}