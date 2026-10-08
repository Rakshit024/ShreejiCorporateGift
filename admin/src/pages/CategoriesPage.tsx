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
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-order');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.categories.list({ page, limit: 20, search, sort, isActive: true });
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, sort]);

  const handleCreate = async (formData: any) => {
    await api.categories.create(formData);
    setModalOpen(false);
    fetchData();
  };

  const handleUpdate = async (formData: any) => {
    await api.categories.update(editing!.id, formData);
    setEditing(null);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await api.categories.delete(deleting);
    setDeleting(null);
    fetchData();
  };

  const openEdit = (cat: any) => { setEditing(cat); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const confirmDelete = (id: string) => setDeleting(id);

  const reorder = async (id: string, direction: 'up' | 'down') => {
    const idx = data.findIndex((c) => c.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= data.length) return;
    const newOrder = [...data];
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    const ids = newOrder.map((c) => c.id);
    await api.categories.reorder(ids);
    fetchData();
  };

  const columns = [
    { key: 'order', header: '', width: '50px', render: (c: any, i: number) => (
      <div className={styles.orderCell}>
        <span>{c.order ?? i + 1}</span>
        <button className={styles.orderBtn} onClick={() => reorder(c.id, 'up')} aria-label="Move up"><ArrowUp size={12} /></button>
        <button className={styles.orderBtn} onClick={() => reorder(c.id, 'down')} aria-label="Move down"><ArrowDown size={12} /></button>
      </div>
    )},
    { key: 'image', header: '', width: '50px', render: (c: any) => c.image ? <img src={c.image} alt="" className={styles.thumb} /> : <span className={styles.noImage}><ImageIcon size={16} /></span> },
    { key: 'icon', header: '', width: '50px', render: (c: any) => <span className={styles.iconBadge} aria-label={c.icon}>{c.icon}</span> },
    { key: 'name', header: 'Name', render: (c: any) => <strong>{c.name}</strong> },
    { key: 'slug', header: 'Slug', width: '160px' },
    { key: 'productCount', header: 'Products', width: '90px', align: 'center' as const, render: (c: any) => <Badge variant="navy">{c.productCount ?? 0}</Badge> },
    { key: 'isActive', header: 'Status', width: '100px', align: 'center' as const, render: (c: any) => (
      <Badge variant={c.isActive ? 'success' : 'outline'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'actions', header: '', width: '130px', render: (c: any) => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => openEdit(c)} aria-label="Edit"><Edit size={16} /></button>
        <button className={styles.iconBtn} onClick={() => confirmDelete(c.id)} aria-label="Delete"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>Manage product categories and their display order</p>
        </div>
        <Button variant="gold" onClick={openCreate}><Plus size={18} /> Add Category</Button>
      </header>

      <div className={styles.toolbar}>
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search size={18} />}
          className={styles.searchInput}
        />
        <Select
          options={[
            { value: '-order', label: 'Order (default)' },
            { value: 'name', label: 'Name A–Z' },
            { value: '-name', label: 'Name Z–A' },
            { value: '-createdAt', label: 'Newest' },
          ]}
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className={styles.sortSelect}
        />
      </div>

      <Table
        columns={columns}
        data={data}
        keyExtractor={(c) => c.id}
        sortBy={sort.replace(/^-/, '')}
        sortDir={sort.startsWith('-') ? 'desc' : 'asc'}
        onSort={(key) => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)}
        loading={loading}
        emptyMessage="No categories found"
      />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Category' : 'Add Category'} size="lg">
        <CategoryForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          submitting={loading}
        />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Category" size="sm">
        <p>Are you sure you want to delete this category? This cannot be undone.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}