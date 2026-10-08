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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('order');
  const [placementFilter, setPlacementFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.banners.list({ page, limit: 20, search, sort, placement: placementFilter, isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined });
      setData(res.items);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, sort, placementFilter, activeFilter]);

  const handleCreate = async (formData: any) => { await api.banners.create(formData); setModalOpen(false); fetchData(); };
  const handleUpdate = async (formData: any) => { await api.banners.update(editing!.id, formData); setEditing(null); setModalOpen(false); fetchData(); };
  const handleDelete = async () => { if (!deleting) return; await api.banners.delete(deleting); setDeleting(null); fetchData(); };
  const openEdit = (b: any) => { setEditing(b); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const confirmDelete = (id: string) => setDeleting(id);
  const toggleActive = async (id: string) => { await api.banners.toggle(id); fetchData(); };

  const columns = [
    { key: 'image', header: '', width: '80px', render: (b: any) => b.image ? <img src={b.image} alt="" className={styles.thumb} /> : <span className={styles.noImage}><Image size={20} /></span> },
    { key: 'title', header: 'Title', render: (b: any) => <strong>{b.title}</strong> },
    { key: 'placement', header: 'Placement', width: '130px', render: (b: any) => <Badge variant="navy">{b.placement}</Badge> },
    { key: 'order', header: 'Order', width: '80px', align: 'center' as const },
    { key: 'status', header: 'Status', width: '100px', align: 'center' as const, render: (b: any) => <Badge variant={b.isActive ? 'success' : 'danger'}>{b.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'schedule', header: 'Schedule', width: '160px', render: (b: any) => {
      if (!b.startsAt && !b.endsAt) return 'Always';
      return `${b.startsAt ? formatRelativeTime(b.startsAt) : '—'} → ${b.endsAt ? formatRelativeTime(b.endsAt) : '—'}`;
    }},
    { key: 'createdAt', header: 'Created', width: '140px', render: (b: any) => formatRelativeTime(b.createdAt) },
    { key: 'actions', header: '', width: '130px', render: (b: any) => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => openEdit(b)} aria-label="Edit"><Edit size={16} /></button>
        <button className={styles.iconBtn} onClick={() => toggleActive(b.id)} aria-label={b.isActive ? 'Deactivate' : 'Activate'} style={{color: b.isActive ? 'var(--color-success)' : 'var(--color-gold)'}}><Eye size={16} /></button>
        <button className={styles.iconBtn} onClick={() => confirmDelete(b.id)} aria-label="Delete"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Banners</h1>
          <p className={styles.subtitle}>Manage promotional banners across the site</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus size={18} /> Add Banner</Button>
      </header>

      <div className={styles.toolbar}>
        <Input placeholder="Search banners…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={18} />} className={styles.searchInput} />
        <Select options={[
          { value: '', label: 'All Placements' },
          { value: 'home-hero', label: 'Home Hero' },
          { value: 'home-mid', label: 'Home Mid' },
          { value: 'category-top', label: 'Category Top' },
          { value: 'popup', label: 'Popup' },
        ]} value={placementFilter} onChange={e => { setPlacementFilter(e.target.value); setPage(1); }} className={styles.filterSelect} />
        <Select options={[
          { value: '', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]} value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1); }} className={styles.filterSelect} />
        <Select options={[
          { value: 'order', label: 'Display Order' },
          { value: '-createdAt', label: 'Newest' },
          { value: 'createdAt', label: 'Oldest' },
        ]} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className={styles.filterSelect} />
      </div>

      <Table columns={columns} data={data} keyExtractor={b => b.id} sortBy={sort.replace(/^-/, '')} sortDir={sort.startsWith('-') ? 'desc' : 'asc'} onSort={key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)} loading={loading} emptyMessage="No banners found" />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Banner' : 'Create Banner'} size="lg">
        <BannerForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          submitting={loading}
        />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Banner" size="sm">
        <p>Are you sure you want to delete this banner? This cannot be undone.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function BannerForm({ initial, onSubmit, onCancel, submitting }: any) {
  const [form, setForm] = useState({
    title: '', subtitle: '', image: '', mobileImage: '', ctaLabel: '', ctaLink: '',
    placement: 'home-hero', order: 0, isActive: true, startsAt: '', endsAt: '',
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mobileUrl, setMobileUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else {
      setForm({
        title: '', subtitle: '', image: '', mobileImage: '', ctaLabel: '', ctaLink: '',
        placement: 'home-hero', order: 0, isActive: true, startsAt: '', endsAt: '',
      });
      setPreviewUrl(null);
      setMobileUrl(null);
    }
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (field === 'image') { setPreviewFile(file); setPreviewUrl(URL.createObjectURL(file)); }
    else { setMobileFile(file); setMobileUrl(URL.createObjectURL(file)); }
  };

  const uploadImage = async (field: string) => {
    const file = field === 'image' ? previewFile : mobileFile;
    if (!file) return;
    try {
      const res = await api.uploads.uploadImage(file);
      const url = res.files[0]?.url ?? '';
      setForm(prev => ({ ...prev, [field]: url }));
      if (field === 'image') { setPreviewUrl(url); setPreviewFile(null); }
      else { setMobileUrl(url); setMobileFile(null); }
    } catch { setErrors({ [field]: 'Upload failed' }); }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (previewFile) await uploadImage('image');
    if (mobileFile) await uploadImage('mobileImage');
    const payload = {
      ...form,
      order: Number(form.order),
      startsAt: form.startsAt ? new Date(form.startsAt).getTime() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).getTime() : null,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <Input label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} required placeholder="e.g. Summer Sale 2026" />
        <Input label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Optional supporting text" />
        <Select label="Placement" name="placement" value={form.placement} onChange={handleChange} options={[
          { value: 'home-hero', label: 'Home Hero' },
          { value: 'home-mid', label: 'Home Mid Section' },
          { value: 'category-top', label: 'Category Page Top' },
          { value: 'popup', label: 'Popup Modal' },
        ]} />
        <Input label="Display Order" name="order" type="number" min="0" value={form.order} onChange={handleChange} />
        <div className={styles.imageUpload}>
          <label className={styles.label}>Main Image</label>
          <div className={styles.preview}>
            {previewUrl ? <> <img src={previewUrl} alt="Preview" /> <button type="button" className={styles.removeBtn} onClick={() => { setForm(prev => ({...prev, image: ''})); setPreviewUrl(null); }} aria-label="Remove"><EyeOff size={16} /></button> </> : <button type="button" className={styles.dropzone} onClick={() => document.getElementById('banner-main')?.click()}><Image size={24} /> Upload</button>}
          </div>
          <input id="banner-main" type="file" accept="image/*" onChange={e => handleImageChange(e, 'image')} className={styles.fileInput} />
          {previewFile && <Button variant="outline" size="sm" type="button" onClick={() => uploadImage('image')}>Upload</Button>}
        </div>
        <div className={styles.imageUpload}>
          <label className={styles.label}>Mobile Image (optional)</label>
          <div className={styles.preview}>
            {mobileUrl ? <> <img src={mobileUrl} alt="Preview" /> <button type="button" className={styles.removeBtn} onClick={() => { setForm(prev => ({...prev, mobileImage: ''})); setMobileUrl(null); }} aria-label="Remove"><EyeOff size={16} /></button> </> : <button type="button" className={styles.dropzone} onClick={() => document.getElementById('banner-mobile')?.click()}><Image size={24} /> Upload</button>}
          </div>
          <input id="banner-mobile" type="file" accept="image/*" onChange={e => handleImageChange(e, 'mobileImage')} className={styles.fileInput} />
          {mobileFile && <Button variant="outline" size="sm" type="button" onClick={() => uploadImage('mobileImage')}>Upload</Button>}
        </div>
        <Input label="CTA Label" name="ctaLabel" value={form.ctaLabel} onChange={handleChange} placeholder="e.g. Shop Now" />
        <Input label="CTA Link" name="ctaLink" value={form.ctaLink} onChange={handleChange} placeholder="/products or https://..." />
        <Input label="Start Date/Time" name="startsAt" type="datetime-local" value={form.startsAt} onChange={handleChange} />
        <Input label="End Date/Time" name="endsAt" type="datetime-local" value={form.endsAt} onChange={handleChange} />
        <div className={styles.fullWidth}>
          <label className={styles.label}><input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({...prev, isActive: e.target.checked}))} /> Active</label>
        </div>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" loading={submitting}>{submitting ? 'Saving…' : (initial ? 'Save Changes' : 'Create Banner')}</Button>
      </div>
    </form>
  );
}