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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.coupons.list({ page, limit: 20, search, sort });
      setData(res.items);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, sort]);

  const handleCreate = async (formData: any) => {
    await api.coupons.create(formData);
    setModalOpen(false);
    fetchData();
  };
  const handleUpdate = async (formData: any) => {
    await api.coupons.update(editing!.id, formData);
    setEditing(null);
    setModalOpen(false);
    fetchData();
  };
  const handleDelete = async () => { if (!deleting) return; await api.coupons.delete(deleting); setDeleting(null); fetchData(); };
  const openEdit = (c: any) => { setEditing(c); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const confirmDelete = (id: string) => setDeleting(id);
  const toggleActive = async (id: string) => { await api.coupons.toggle(id); fetchData(); };

  const columns = [
    { key: 'code', header: 'Code', width: '130px', render: (c: any) => <strong>{c.code}</strong> },
    { key: 'description', header: 'Description', render: (c: any) => c.description || '—' },
    { key: 'discount', header: 'Discount', width: '130px', align: 'center' as const, render: (c: any) => c.discountType === 'percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue) },
    { key: 'limits', header: 'Limits', width: '140px', render: (c: any) => {
      const parts = [];
      if (c.minimumOrderValue) parts.push(`Min ₹${c.minimumOrderValue.toLocaleString()}`);
      if (c.minimumQuantity > 1) parts.push(`Min ${c.minimumQuantity} qty`);
      if (c.usageLimit) parts.push(`Max ${c.usageLimit} uses`);
      return parts.join(' · ') || '—';
    }},
    { key: 'validity', header: 'Validity', width: '160px', render: (c: any) => {
      if (!c.validFrom && !c.validUntil) return 'Always';
      return `${c.validFrom ? formatDate(c.validFrom) : '—'} → ${c.validUntil ? formatDate(c.validUntil) : '—'}`;
    }},
    { key: 'status', header: 'Status', width: '100px', align: 'center' as const, render: (c: any) => <Badge variant={c.isActive ? (c.isExpired ? 'warning' : c.isExhausted ? 'danger' : 'success') : 'danger'}>{c.isActive ? (c.isExpired ? 'Expired' : c.isExhausted ? 'Exhausted' : 'Active') : 'Inactive'}</Badge> },
    { key: 'usedCount', header: 'Used', width: '80px', align: 'center' as const, render: (c: any) => `${c.usedCount}${c.usageLimit ? `/${c.usageLimit}` : ''}` },
    { key: 'actions', header: '', width: '130px', render: (c: any) => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => openEdit(c)} aria-label="Edit"><Edit size={16} /></button>
        <button className={styles.iconBtn} onClick={() => toggleActive(c.id)} aria-label={c.isActive ? 'Deactivate' : 'Activate'} style={{color: c.isActive ? 'var(--color-success)' : 'var(--color-gold)'}}><Tag size={16} /></button>
        <button className={styles.iconBtn} onClick={() => confirmDelete(c.id)} aria-label="Delete"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupons</h1>
          <p className={styles.subtitle}>Create and manage discount codes</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus size={18} /> Add Coupon</Button>
      </header>

      <div className={styles.toolbar}>
        <Input placeholder="Search coupons…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={18} />} className={styles.searchInput} />
        <Select options={[
          { value: '-createdAt', label: 'Newest' },
          { value: 'createdAt', label: 'Oldest' },
          { value: 'code', label: 'Code A–Z' },
        ]} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className={styles.filterSelect} />
      </div>

      <Table columns={columns} data={data} keyExtractor={c => c.id} sortBy={sort.replace(/^-/, '')} sortDir={sort.startsWith('-') ? 'desc' : 'asc'} onSort={key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)} loading={loading} emptyMessage="No coupons found" />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Coupon' : 'Create Coupon'} size="lg">
        <CouponForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          submitting={loading}
        />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Coupon" size="sm">
        <p>Are you sure you want to delete this coupon? This cannot be undone.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function CouponForm({ initial, onSubmit, onCancel, submitting }: any) {
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: 0, maxDiscountAmount: '',
    minimumOrderValue: 0, minimumQuantity: 1, usageLimit: '', perUserLimit: '',
    validFrom: '', validUntil: '', applicableCategories: [], applicableProducts: [], isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else {
      setForm({
        code: '', description: '', discountType: 'percentage', discountValue: 0, maxDiscountAmount: '',
        minimumOrderValue: 0, minimumQuantity: 1, usageLimit: '', perUserLimit: '',
        validFrom: '', validUntil: '', applicableCategories: [], applicableProducts: [], isActive: true,
      });
    }
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Code is required';
    if (form.discountValue <= 0) newErrors.discountValue = 'Must be greater than 0';
    if (form.discountType === 'percentage' && form.discountValue > 100) newErrors.discountValue = 'Percentage cannot exceed 100%';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <Input label="Code" name="code" value={form.code} onChange={handleChange} error={errors.code} placeholder="e.g. WELCOME10" required />
        <Input label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Optional" />
        <Select label="Discount Type" name="discountType" value={form.discountType} onChange={handleChange} options={[
          { value: 'percentage', label: 'Percentage (%)' },
          { value: 'fixed', label: 'Fixed Amount (₹)' },
        ]} />
        <Input label="Discount Value" name="discountValue" type="number" min="0" step={form.discountType === 'percentage' ? '1' : '0.01'} value={form.discountValue} onChange={handleChange} error={errors.discountValue} placeholder={form.discountType === 'percentage' ? '10' : '500'} required />
        <Input label="Max Discount (₹)" name="maxDiscountAmount" type="number" min="0" step="0.01" value={form.maxDiscountAmount} onChange={handleChange} placeholder="Optional (percentage only)" />
        <Input label="Min Order Value (₹)" name="minimumOrderValue" type="number" min="0" step="0.01" value={form.minimumOrderValue} onChange={handleChange} />
        <Input label="Min Quantity" name="minimumQuantity" type="number" min="1" value={form.minimumQuantity} onChange={handleChange} />
        <Input label="Usage Limit" name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={handleChange} placeholder="Optional" />
        <Input label="Per User Limit" name="perUserLimit" type="number" min="1" value={form.perUserLimit} onChange={handleChange} placeholder="Optional" />
        <Input label="Valid From" name="validFrom" type="date" value={form.validFrom} onChange={handleChange} />
        <Input label="Valid Until" name="validUntil" type="date" value={form.validUntil} onChange={handleChange} />
        <div className={styles.fullWidth}>
          <label className={styles.label}>Applicable Categories</label>
          <div className={styles.multiSelect}>
            <button type="button" className={styles.chip} onClick={() => setForm(prev => ({...prev, applicableCategories: []}))}>Clear</button>
          </div>
        </div>
        <div className={styles.fullWidth}>
          <label className={styles.label}>Applicable Products</label>
          <div className={styles.multiSelect}>
            <button type="button" className={styles.chip} onClick={() => setForm(prev => ({...prev, applicableProducts: []}))}>Clear</button>
          </div>
        </div>
        <div className={styles.fullWidth}>
          <label className={styles.label}><input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({...prev, isActive: e.target.checked}))} /> Active</label>
        </div>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" loading={submitting}>{submitting ? 'Saving…' : (initial ? 'Save Changes' : 'Create Coupon')}</Button>
      </div>
    </form>
  );
}