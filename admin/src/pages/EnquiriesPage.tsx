import { useEffect, useState } from 'react';
import { Search, Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './EnquiriesPage.module.css';

const STATUS_BADGE: Record<string, 'gold'|'navy'|'outline'|'success'|'warning'|'danger'> = {
  new: 'gold', contacted: 'navy', quoted: 'warning', won: 'success', lost: 'danger',
};

export function EnquiriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.enquiries.list({ page, limit: 20, search, sort, status: statusFilter });
      setData(res.items);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, sort, statusFilter]);

  const openDetail = (e: any) => { setDetail(e); setModalOpen(true); };

  const columns = [
    { key: 'reference', header: 'Ref', width: '110px' },
    { key: 'name', header: 'Customer', render: (e: any) => (
      <div><strong>{e.name}</strong><br/><small style={{color: 'var(--color-text-muted)'}}>{e.companyName || '—'}</small></div>
    )},
    { key: 'contact', header: 'Contact', width: '180px', render: (e: any) => (
      <div>
        <div><Mail size={12} /> {e.email}</div>
        <div><Phone size={12} /> {e.phone}</div>
      </div>
    )},
    { key: 'product', header: 'Product', width: '140px' },
    { key: 'quantity', header: 'Qty', width: '70px', align: 'center' as const },
    { key: 'status', header: 'Status', width: '110px', align: 'center' as const, render: (e: any) => <Badge variant={STATUS_BADGE[e.status]}>{e.status}</Badge> },
    { key: 'createdAt', header: 'Date', width: '140px', render: (e: any) => formatRelativeTime(e.createdAt) },
    { key: 'actions', header: '', width: '100px', render: (e: any) => (
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={() => openDetail(e)} aria-label="View details"><Edit size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Enquiries</h1>
          <p className={styles.subtitle}>Bulk quote requests from the storefront</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Input placeholder="Search enquiries…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={18} />} className={styles.searchInput} />
        <Select options={[
          { value: '', label: 'All Status' },
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'quoted', label: 'Quoted' },
          { value: 'won', label: 'Won' },
          { value: 'lost', label: 'Lost' },
        ]} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={styles.filterSelect} />
        <Select options={[
          { value: '-createdAt', label: 'Newest' },
          { value: 'createdAt', label: 'Oldest' },
          { value: 'reference', label: 'Reference' },
        ]} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className={styles.filterSelect} />
      </div>

      <Table columns={columns} data={data} keyExtractor={e => e.id} sortBy={sort.replace(/^-/, '')} sortDir={sort.startsWith('-') ? 'desc' : 'asc'} onSort={key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)} loading={loading} emptyMessage="No enquiries found" />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setDetail(null); }} title={`Enquiry ${detail?.reference}`} size="lg">
        {detail && (
          <div className={styles.detail}>
            <div className={styles.detailRow}>
              <div className={styles.detailCol}>
                <h4>Customer</h4>
                <p><strong>{detail.name}</strong></p>
                <p>{detail.companyName || '—'}</p>
                <p><Mail size={14} /> {detail.email}</p>
                <p><Phone size={14} /> {detail.phone}</p>
              </div>
              <div className={styles.detailCol}>
                <h4>Details</h4>
                <p><MapPin size={14} /> {detail.deliveryLocation || '—'}</p>
                <p><Calendar size={14} /> Required: {detail.requiredDate || '—'}</p>
                <p>Qty: {detail.quantity}</p>
                <p>Branding: {detail.brandingRequired || '—'}</p>
              </div>
            </div>
            <hr className={styles.detailDivider} />
            <h4>Items</h4>
            <Table
              columns={[
                { key: 'productName', header: 'Product', render: (i: any) => <strong>{i.productName}</strong> },
                { key: 'quantity', header: 'Qty', width: '70px', align: 'center' as const },
                { key: 'brandingLabel', header: 'Branding', width: '140px' },
                { key: 'unitPrice', header: 'Unit Price', width: '120px', align: 'right', render: (i: any) => `₹${i.unitPrice.toLocaleString()}` },
              ]}
              data={detail.items}
              keyExtractor={(item) => item.id}
            />
            <div className={styles.detailFooter}>
              <div className={styles.detailActions}>
                <label className={styles.statusSelect}>
                  Status
                  <Select
                    options={Object.keys(STATUS_BADGE).map(k => ({ value: k, label: k }))}
                    value={detail.status}
onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                      const v = e.target.value as 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
                      await api.enquiries.update(detail.id, { status: v });
                      setDetail({ ...detail, status: v });
                      fetchData();
                    }}
                  />
                </label>
                <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
              </div>
            </div>
            <div className={styles.notes}>
              <h4>Message</h4>
              <p style={{whiteSpace: 'pre-wrap'}}>{detail.message || '—'}</p>
              <h4>Admin Notes</h4>
              <textarea
                value={detail.adminNotes}
onChange={async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  await api.enquiries.update(detail.id, { adminNotes: e.target.value });
                  setDetail({ ...detail, adminNotes: e.target.value });
                }}
                rows={3}
                className={styles.notesTextarea}
                placeholder="Add internal notes…"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}