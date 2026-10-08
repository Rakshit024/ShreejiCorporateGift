import { useEffect, useState } from 'react';
import { Search, Trash2, User, Shield } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './CustomersPage.module.css';

export function CustomersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-totalSpent');
  const [blockedFilter, setBlockedFilter] = useState('');
  
  const [detail, setDetail] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.customers.list({ page, limit: 20, search, sort, isBlocked: blockedFilter === 'blocked' ? true : blockedFilter === 'active' ? false : undefined });
      setData(res.items);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, sort, blockedFilter]);

  const openDetail = (c: any) => { setDetail(c); };
  const confirmDelete = (id: string) => setDeleting(id);
  const handleDelete = async () => { if (!deleting) return; await api.customers.delete(deleting); setDeleting(null); fetchData(); };
  const toggleBlocked = async (id: string) => { await api.customers.toggleBlocked(id); fetchData(); };

  const columns = [
    { key: 'name', header: 'Customer', render: (c: any) => (
      <div><strong>{c.name}</strong>{c.companyName && <> <br/><small style={{color: 'var(--color-text-muted)'}}>{c.companyName}</small> </>}</div>
    )},
    { key: 'email', header: 'Email', width: '200px' },
    { key: 'phone', header: 'Phone', width: '140px' },
    { key: 'totalSpent', header: 'Total Spent', width: '120px', align: 'right' as const, render: (c: any) => `₹${c.totalSpent.toLocaleString()}` },
    { key: 'orderCount', header: 'Orders', width: '80px', align: 'center' as const },
    { key: 'enquiryCount', header: 'Enquiries', width: '90px', align: 'center' as const },
    { key: 'isBlocked', header: 'Status', width: '100px', align: 'center' as const, render: (c: any) => <Badge variant={c.isBlocked ? 'danger' : 'success'}>{c.isBlocked ? 'Blocked' : 'Active'}</Badge> },
    { key: 'createdAt', header: 'Joined', width: '140px', render: (c: any) => formatRelativeTime(c.createdAt) },
    { key: 'actions', header: '', width: '130px', render: (c: any) => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => openDetail(c)} aria-label="View"><User size={16} /></button>
        <button className={styles.iconBtn} onClick={() => toggleBlocked(c.id)} aria-label={c.isBlocked ? 'Unblock' : 'Block'} style={{color: c.isBlocked ? 'var(--color-success)' : 'var(--color-danger)'}}><Shield size={16} /></button>
        <button className={styles.iconBtn} onClick={() => confirmDelete(c.id)} aria-label="Delete"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>Manage customer accounts and order history</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Input placeholder="Search customers…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={18} />} className={styles.searchInput} />
        <Select options={[
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'blocked', label: 'Blocked' },
        ]} value={blockedFilter} onChange={e => { setBlockedFilter(e.target.value); setPage(1); }} className={styles.filterSelect} />
        <Select options={[
          { value: '-totalSpent', label: 'Top Spenders' },
          { value: '-createdAt', label: 'Newest' },
          { value: 'createdAt', label: 'Oldest' },
          { value: 'name', label: 'Name A–Z' },
        ]} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className={styles.filterSelect} />
      </div>

      <Table columns={columns} data={data} keyExtractor={c => c.id} sortBy={sort.replace(/^-/, '')} sortDir={sort.startsWith('-') ? 'desc' : 'asc'} onSort={key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)} loading={loading} emptyMessage="No customers found" />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name} size="lg">
        {detail && (
          <div className={styles.detail}>
            <div className={styles.detailGrid}>
              <div className={styles.detailCol}>
                <h4>Contact</h4>
                <p><strong>{detail.name}</strong></p>
                <p>{detail.companyName || '—'}</p>
                <p>{detail.email}</p>
                <p>{detail.phone || '—'}</p>
              </div>
              <div className={styles.detailCol}>
                <h4>Address</h4>
                <p>{detail.billingAddress?.line1 || '—'}</p>
                <p>{[detail.billingAddress?.city, detail.billingAddress?.state, detail.billingAddress?.postalCode].filter(Boolean).join(', ') || '—'}</p>
                <p>{detail.billingAddress?.country || 'India'}</p>
              </div>
              <div className={styles.detailCol}>
                <h4>Stats</h4>
                <p>Orders: {detail.orderCount}</p>
                <p>Enquiries: {detail.enquiryCount}</p>
                <p>Total Spent: ₹{detail.totalSpent.toLocaleString()}</p>
                <p>Last Order: {detail.lastOrderAt ? formatRelativeTime(detail.lastOrderAt) : 'Never'}</p>
              </div>
            </div>
            <hr className={styles.detailDivider} />
            <div className={styles.detailFooter}>
              <Button variant={detail.isBlocked ? 'success' : 'danger'} onClick={() => toggleBlocked(detail.id)}>
                {detail.isBlocked ? 'Unblock Customer' : 'Block Customer'}
              </Button>
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Customer" size="sm">
        <p>Are you sure you want to delete this customer? This cannot be undone.</p>
        <div className={styles.modalActions}>
          <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}