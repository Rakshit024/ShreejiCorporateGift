import { useEffect, useState } from 'react';
import { Search, Edit } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './OrdersPage.module.css';

const STATUS_BADGE: Record<string, 'gold'|'navy'|'outline'|'success'|'warning'|'danger'> = {
  pending: 'gold', confirmed: 'navy', processing: 'warning', dispatched: 'success', delivered: 'success', cancelled: 'danger',
};
const PAYMENT_BADGE: Record<string, 'gold'|'navy'|'outline'|'success'|'warning'|'danger'> = {
  unpaid: 'danger', partial: 'warning', paid: 'success', refunded: 'navy',
};

export function OrdersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.orders.list({ page, limit: 20, search, sort, status: statusFilter, paymentStatus: paymentFilter });
      setData(res.items);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, sort, statusFilter, paymentFilter]);

  const openDetail = (o: any) => { setDetail(o); setModalOpen(true); };

  const columns = [
    { key: 'reference', header: 'Order #', width: '120px' },
    { key: 'customerName', header: 'Customer', render: (o: any) => <strong>{o.customerName}</strong> },
    { key: 'companyName', header: 'Company', width: '140px' },
    { key: 'items', header: 'Items', width: '90px', align: 'center' as const, render: (o: any) => o.items.length },
    { key: 'total', header: 'Total', width: '120px', align: 'right' as const, render: (o: any) => formatCurrency(o.total) },
    { key: 'status', header: 'Status', width: '110px', align: 'center' as const, render: (o: any) => <Badge variant={STATUS_BADGE[o.status]}>{o.status}</Badge> },
    { key: 'paymentStatus', header: 'Payment', width: '110px', align: 'center' as const, render: (o: any) => <Badge variant={PAYMENT_BADGE[o.paymentStatus]}>{o.paymentStatus}</Badge> },
    { key: 'createdAt', header: 'Date', width: '140px', render: (o: any) => formatRelativeTime(o.createdAt) },
    { key: 'actions', header: '', width: '90px', render: (o: any) => <div className={styles.actions}><button className={styles.iconBtn} onClick={() => openDetail(o)} aria-label="View"><Edit size={16} /></button></div> },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>Track and manage customer orders</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <Input placeholder="Search orders…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={18} />} className={styles.searchInput} />
        <Select options={[
          { value: '', label: 'All Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'processing', label: 'Processing' },
          { value: 'dispatched', label: 'Dispatched' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ]} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={styles.filterSelect} />
        <Select options={[
          { value: '', label: 'All Payments' },
          { value: 'unpaid', label: 'Unpaid' },
          { value: 'partial', label: 'Partial' },
          { value: 'paid', label: 'Paid' },
          { value: 'refunded', label: 'Refunded' },
        ]} value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} className={styles.filterSelect} />
        <Select options={[
          { value: '-createdAt', label: 'Newest' },
          { value: 'createdAt', label: 'Oldest' },
          { value: '-total', label: 'Highest Value' },
          { value: 'total', label: 'Lowest Value' },
        ]} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className={styles.filterSelect} />
      </div>

      <Table columns={columns} data={data} keyExtractor={o => o.id} sortBy={sort.replace(/^-/, '')} sortDir={sort.startsWith('-') ? 'desc' : 'asc'} onSort={key => setSort(s => s.startsWith('-') && s.slice(1) === key ? key : `-${key}`)} loading={loading} emptyMessage="No orders found" />

      <div className={styles.pagination}>
        <span>Showing {data.length} of {total}</span>
        <div className={styles.pageBtns}>
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setDetail(null); }} title={`Order ${detail?.reference}`} size="xl">
        {detail && (
          <div className={styles.detail}>
            <div className={styles.detailGrid}>
              <div className={styles.detailCol}>
                <h4>Customer</h4>
                <p><strong>{detail.customerName}</strong></p>
                <p>{detail.companyName || '—'}</p>
                <p>{detail.customerEmail}</p>
                <p>{detail.customerPhone || '—'}</p>
              </div>
              <div className={styles.detailCol}>
                <h4>Delivery</h4>
                <p>{detail.deliveryAddress?.line1 || '—'}</p>
                <p>{[detail.deliveryAddress?.city, detail.deliveryAddress?.state, detail.deliveryAddress?.postalCode].filter(Boolean).join(', ') || '—'}</p>
                <p>{detail.deliveryAddress?.country || 'India'}</p>
              </div>
              <div className={styles.detailCol}>
                <h4>Payment</h4>
                <p>Method: {detail.paymentMethod || '—'}</p>
                <p>Status: <Badge variant={PAYMENT_BADGE[detail.paymentStatus]}>{detail.paymentStatus}</Badge></p>
              </div>
              <div className={styles.detailCol}>
                <h4>Status</h4>
                <p><Badge variant={STATUS_BADGE[detail.status]}>{detail.status}</Badge></p>
                <p>Placed: {formatRelativeTime(detail.createdAt)}</p>
              </div>
            </div>
            <hr className={styles.detailDivider} />
            <h4>Items</h4>
            <Table
              columns={[
                { key: 'name', header: 'Product', render: (i: any) => <strong>{i.name}</strong> },
                { key: 'sku', header: 'SKU', width: '120px' },
                { key: 'quantity', header: 'Qty', width: '70px', align: 'center' as const },
                { key: 'unitPrice', header: 'Unit', width: '100px', align: 'right' as const, render: (i: any) => formatCurrency(i.unitPrice) },
                { key: 'lineTotal', header: 'Total', width: '100px', align: 'right' as const, render: (i: any) => formatCurrency(i.lineTotal) },
              ]}
              data={detail.items}
              keyExtractor={(item) => item.id}
            />
            <div className={styles.totals}>
              <div className={styles.totalRow}><span>Subtotal</span><span>{formatCurrency(detail.subtotal)}</span></div>
              <div className={styles.totalRow}><span>Discount</span><span>{formatCurrency(detail.discount)}</span></div>
              <div className={styles.totalRow}><span>Shipping</span><span>{formatCurrency(detail.shipping)}</span></div>
              <div className={styles.totalRow}><span>Tax</span><span>{formatCurrency(detail.tax)}</span></div>
              <div className={styles.totalRowGrand}><span>Grand Total</span><span>{formatCurrency(detail.total)}</span></div>
            </div>
            <div className={styles.detailFooter}>
              <label className={styles.statusSelect}>
                Status
                <Select
                  options={Object.keys(STATUS_BADGE).map(k => ({ value: k, label: k }))}
                  value={detail.status}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const v = e.target.value as 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
                    await api.orders.update(detail.id, { status: v });
                    setDetail({ ...detail, status: v });
                    fetchData();
                  }}
                />
              </label>
              <label className={styles.statusSelect}>
                Payment
                <Select
                  options={Object.keys(PAYMENT_BADGE).map(k => ({ value: k, label: k }))}
                  value={detail.paymentStatus}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const v = e.target.value as 'unpaid' | 'partial' | 'paid' | 'refunded';
                    await api.orders.update(detail.id, { paymentStatus: v });
                    setDetail({ ...detail, paymentStatus: v });
                    fetchData();
                  }}
                />
              </label>
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}