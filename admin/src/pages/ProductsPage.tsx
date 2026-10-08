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
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [featureIds, setFeatureIds] = useState<string[]>([]);

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, sort, categoryFilter, stockFilter]);

  const handleCreate = async (formData: any) => {
    await api.products.create(formData);
    setModalOpen(false);
    fetchData();
  };
  const handleUpdate = async (formData: any) => {
    await api.products.update(editing!.id, formData);
    setEditing(null);
    setModalOpen(false);
    fetchData();
  };
  const handleDelete = async () => {
    if (!deleting) return;
    await api.products.delete(deleting);
    setDeleting(null);
    fetchData();
  };
  const openEdit = (p: any) => { setEditing(p); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const confirmDelete = (id: string) => setDeleting(id);

  const toggleFeatured = async (id: string) => { await api.products.toggleFeatured(id); fetchData(); };
  const toggleAvailable = async (id: string) => { await api.products.toggleAvailability(id); fetchData(); };
  const duplicate = async (id: string) => { await api.products.duplicate(id); fetchData(); };

  const bulkAction = async (action: string) => {
    if (!featureIds.length) return;
    await api.products.bulkAction(featureIds, action);
    setFeatureIds([]);
    fetchData();
  };

  const columns = [
    { key: 'image', header: '', width: '50px', render: (p: any) => p.image ? <img src={p.image} alt="" className={styles.thumb} /> : <span className={styles.noImage}><Tag size={16} /></span> },
    { key: 'name', header: 'Product', render: (p: any) => <strong>{p.name}</strong> },
    { key: 'sku', header: 'SKU', width: '100px' },
    { key: 'category', header: 'Category', width: '140px' },
    { key: 'priceFrom', header: 'Price', width: '100px', align: 'right' as const, render: (p: any) => `₹${p.priceFrom.toLocaleString()}` },
    { key: 'stock', header: 'Stock', width: '90px', align: 'center' as const, render: (p: any) => <Badge variant={p.stock === 0 ? 'danger' : p.stock <= (p.lowStockThreshold ?? 5) ? 'warning' : 'success'}>{p.stock}</Badge> },
    { key: 'badges', header: '', width: '130px', render: (p: any) => (
      <div className={styles.badgeRow}>
        {p.customizable && <span title="Customizable product"><Badge variant="navy">Custom</Badge></span>}
        {p.bulkPricing && <span title="Bulk pricing available"><Badge variant="outline">Bulk</Badge></span>}
        {!p.available && <span title="Product is not available"><Badge variant="danger">Inactive</Badge></span>}
      </div>
    )},
    { key: 'actions', header: '', width: '160px', render: (p: any) => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => openEdit(p)} aria-label="Edit" title="Edit product"><Edit size={16} /></button>
        <button className={styles.iconBtn} onClick={() => duplicate(p.id)} aria-label="Duplicate" title="Duplicate product"><Tag size={16} /></button>
        <button className={styles.iconBtn} onClick={() => toggleFeatured(p.id)} aria-label={p.featured ? 'Remove from featured' : 'Mark as featured'} title={p.featured ? 'Featured (click to remove)' : 'Not featured (click to feature)'} style={{ color: p.featured ? 'var(--color-gold)' : 'var(--color-text-muted)' }}><Badge variant={p.featured ? 'gold' : 'outline'} >{p.featured ? '★' : '☆'}</Badge></button>
        <button className={styles.iconBtn} onClick={() => toggleAvailable(p.id)} aria-label={p.available ? 'Disable product' : 'Enable product'} title={p.available ? 'Active (click to disable)' : 'Inactive (click to enable)'} style={{ color: p.available ? 'var(--color-success)' : 'var(--color-danger)' }}><Badge variant={p.available ? 'success' : 'danger'} >{p.available ? 'Active' : 'Inactive'}</Badge></button>
        <button className={styles.iconBtn} onClick={() => confirmDelete(p.id)} aria-label="Delete" title="Delete product"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your corporate gift catalog</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus size={18} /> Add Product</Button>
      </header>

      <div className={styles.toolbar}>
        <Input placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={18} />} className={styles.searchInput} />
        <Select
          options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className={styles.filterSelect}
        />
        <Select
          options={[
            { value: 'all', label: 'All Stock' },
            { value: 'low', label: 'Low Stock' },
            { value: 'out', label: 'Out of Stock' },
          ]}
          value={stockFilter}
          onChange={e => { setStockFilter(e.target.value as any); setPage(1); }}
          className={styles.filterSelect}
        />
        <Select
          options={[
            { value: '-createdAt', label: 'Newest' },
            { value: 'createdAt', label: 'Oldest' },
            { value: 'name', label: 'Name A–Z' },
            { value: '-name', label: 'Name Z–A' },
            { value: 'priceFrom', label: 'Price ↑' },
            { value: '-priceFrom', label: 'Price ↓' },
          ]}
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          className={styles.filterSelect}
        />
      </div>

      {featureIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span>{featureIds.length} selected</span>
          <div className={styles.bulkActions}>
            <Button variant="outline" size="sm" onClick={() => bulkAction('feature')}>Feature</Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction('unfeature')}>Unfeature</Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction('available')}>Enable</Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction('unavailable')}>Disable</Button>
            <Button variant="outline" size="sm" onClick={() => setFeatureIds([])}>Clear</Button>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        data={data}
        keyExtractor={(p) => p.id}
        sortBy={sort.replace(/^-/, '')}
        sortDir={sort.startsWith('-') ? 'desc' : 'asc'}
        onSort={key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)}
        loading={loading}
        emptyMessage="No products found"
        onRowClick={p => { setFeatureIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]); }}
      />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Product' : 'Add Product'} size="xl">
        <ProductForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          submitting={loading}
          categories={categories}
        />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Product" size="sm">
        <p>Are you sure you want to delete this product? This cannot be undone.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}