import { useEffect, useState } from 'react';
import { Package, DollarSign, AlertCircle, Package as PackageIcon } from 'lucide-react';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';
import styles from './DashboardPage.module.css';

const STAT_CARDS = [
  { key: 'totalProducts', label: 'Total Products', icon: PackageIcon, color: 'var(--color-navy)', bg: 'rgba(7,31,67,0.08)' },
  { key: 'availableProducts', label: 'Available', icon: Package, color: '#166534', bg: 'rgba(22,101,52,0.1)' },
  { key: 'lowStockProducts', label: 'Low Stock', icon: AlertCircle, color: 'var(--color-gold-hover)', bg: 'var(--color-gold-muted)' },
  { key: 'totalCategories', label: 'Categories', icon: Package, color: 'var(--color-teal)', bg: 'var(--color-teal-muted)' },
  { key: 'newEnquiries', label: 'New Enquiries', icon: AlertCircle, color: 'var(--color-danger)', bg: 'var(--color-danger-muted)' },
  { key: 'revenueLast30Days', label: 'Revenue (30d)', icon: DollarSign, color: '#166534', bg: 'rgba(22,101,52,0.1)', isCurrency: true },
] as const;

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dash, enq, stock] = await Promise.all([
          api.admin.dashboard(),
          api.enquiries.list({ limit: 5, sort: '-createdAt' }),
          api.admin.stockAlerts(),
        ]);
        setStats(dash);
        setRecentEnquiries(enq.items);
        setLowStock(stock.items);
        setTopProducts(dash.topProducts);
        setRevenueTrend(dash.revenueTrend);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard…</div>;

  const getStatValue = (key: string) => stats?.[key] ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of your corporate gifting business</p>
      </header>

      <section className={styles.grid} aria-label="Key metrics">
        {STAT_CARDS.map((card) => {
          const value = card.key.includes('.') ? card.key.split('.').reduce((o, k) => o?.[k], stats) : getStatValue(card.key);
          return (
            <article key={card.key} className={styles.card} style={{ '--card-color': card.color, '--card-bg': card.bg } as React.CSSProperties}>
              <div className={styles.cardIcon} style={{ background: card.bg, color: card.color }}>
                <card.icon size={22} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardLabel}>{card.label}</p>
                <p className={styles.cardValue}>
                  {card.key === 'revenueLast30Days' ? formatCurrency(value) : value.toLocaleString()}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <div className={styles.twoCol}>
        <section className={styles.panel} aria-labelledby="enquiries-heading">
          <header className={styles.panelHeader}>
            <h2 id="enquiries-heading" className={styles.panelTitle}>Recent Enquiries</h2>
            <Button variant="ghost" size="sm" ><a href="/enquiries">View all</a></Button>
          </header>
          <Table
            data={recentEnquiries}
            keyExtractor={(e) => e.id}
            columns={[
              { key: 'reference', header: 'Ref', width: '110px' },
              { key: 'name', header: 'Customer', render: (e) => <strong>{e.name}</strong> },
              { key: 'companyName', header: 'Company', width: '140px' },
              { key: 'status', header: 'Status', width: '110px', render: (e) => <Badge variant={STATUS_BADGE[e.status]}>{e.status}</Badge> },
              { key: 'createdAt', header: 'Date', width: '140px', render: (e) => formatRelativeTime(e.createdAt) },
            ]}
          />
        </section>

        <section className={styles.panel} aria-labelledby="stock-heading">
          <header className={styles.panelHeader}>
            <h2 id="stock-heading" className={styles.panelTitle}>Low Stock Alerts</h2>
            <Button variant="ghost" size="sm" ><a href="/products?stock=low">View all</a></Button>
          </header>
          <Table
            data={lowStock}
            keyExtractor={(p) => p.id}
            columns={[
              { key: 'image', header: '', width: '48px', render: (p) => <img src={p.image || '/placeholder.svg'} alt="" className={styles.thumb} /> },
              { key: 'name', header: 'Product', render: (p) => <strong>{p.name}</strong> },
              { key: 'category', header: 'Category', width: '130px' },
              { key: 'stock', header: 'Stock', width: '80px', render: (p) => <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>{p.stock} / {p.lowStockThreshold}</Badge> },
            ]}
          />
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="revenue-heading">
        <header className={styles.panelHeader}>
          <h2 id="revenue-heading" className={styles.panelTitle}>Revenue Trend (Last 14 Days)</h2>
        </header>
        <div className={styles.chartWrap}>
          <RevenueChart data={revenueTrend} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="top-heading">
        <header className={styles.panelHeader}>
          <h2 id="top-heading" className={styles.panelTitle}>Top Selling Products</h2>
        </header>
        <Table
          data={topProducts}
          keyExtractor={(p) => p.id}
          columns={[
            { key: 'name', header: 'Product', render: (p) => <strong>{p.name}</strong> },
            { key: 'sold', header: 'Units Sold', width: '110px', align: 'right' },
            { key: 'revenue', header: 'Revenue', width: '140px', align: 'right', render: (p) => formatCurrency(p.revenue) },
          ]}
        />
      </section>
    </div>
  );
}

const STATUS_BADGE: Record<string, 'gold'|'navy'|'outline'|'success'|'warning'|'danger'> = {
  new: 'gold', contacted: 'navy', quoted: 'warning', won: 'success', lost: 'danger',
};

function RevenueChart({ data }: { data: Array<{ date: string; revenue: number; orders: number }> }) {
  if (!data?.length) return <p className={styles.empty}>No revenue data yet.</p>;
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className={styles.chart} role="img" aria-label="Revenue bar chart">
      {data.map((d, _i) => (
        <div key={d.date} className={styles.barGroup}>
          <div
            className={styles.bar}
            style={{ height: `${(d.revenue / maxRev) * 100}%` } as React.CSSProperties}
            title={`₹${d.revenue.toLocaleString()} • ${d.orders} orders`}
          />
          <span className={styles.barLabel}>{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      ))}
    </div>
  );
}