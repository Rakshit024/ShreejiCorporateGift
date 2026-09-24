import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { PageMeta } from '../components/common/PageMeta';
import { EmptyState } from '../components/common/EmptyState';
import { Button, ButtonLink } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { ProductFiltersPanel } from '../components/product/ProductFilters';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductSearch } from '../components/product/ProductSearch';
import { ProductImage } from '../components/product/ProductImage';
import { defaultFilters, useCatalogState } from '../hooks/useCatalogState';
import { useProducts } from '../hooks/useProducts';
import { pageTitle } from '../config/seo';
import { formatPriceFrom } from '../utils/formatCurrency';
import { useQuoteCart } from '../context/QuoteCartContext';
import type { Product, ProductFilters } from '../types';
import styles from './CatalogPage.module.css';

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useQuoteCart();

  return (
    <div>
      <ProductImage src={product.image} alt={product.name} />
      <p style={{ color: 'var(--color-text-muted)' }}>{product.shortDescription}</p>
      <p style={{ fontWeight: 700 }}>{formatPriceFrom(product.priceFrom)}</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <ButtonLink to={`/products/${product.id}`} variant="outline" onClick={onClose}>
          View Details
        </ButtonLink>
        <Button
          variant="gold"
          disabled={!product.available}
          onClick={() => {
            addItem({ productId: product.id, quantity: 1 });
            onClose();
          }}
        >
          {product.available ? 'Add to Quote' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const {
    filters,
    setFilters,
    clearFilters,
    sort,
    setSort,
    mobileFiltersOpen,
    setMobileFiltersOpen,
  } = useCatalogState();
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(filters);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const products = useProducts(filters, sort);

  const openMobileFilters = () => {
    setDraftFilters(filters);
    setMobileFiltersOpen(true);
  };

  const clearDraftFilters = () => {
    setDraftFilters(defaultFilters);
    clearFilters();
  };

  return (
    <>
      <PageMeta
        title={pageTitle('Products')}
        description="Browse corporate gifts, promotional products and bulk pricing from Shreeji Corporate Gift."
      />
      <div className="container">
        <div className={styles.layout}>
          <ProductFiltersPanel
            className={styles.sidebarDesktop}
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />

          <div>
            <h1 className="section-title">Product Catalog</h1>
            <p className="section-subtitle">
              Search, filter and add items to your quote cart for bulk enquiries.
            </p>

            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <p className={styles.count}>
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </p>
                <div className={styles.searchTablet}>
                  <ProductSearch
                    compact
                    id="catalog-search-tablet"
                    value={filters.search}
                    onChange={(search) => setFilters({ ...filters, search })}
                  />
                </div>
              </div>
              <select
                className={styles.sort}
                value={sort}
                aria-label="Sort products"
                onChange={(event) => setSort(event.target.value as typeof sort)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
              <Button variant="outline" size="sm" onClick={openMobileFilters}>
                <SlidersHorizontal size={16} /> Filters
              </Button>
            </div>

            <div className={styles.mobileSearch}>
              <ProductSearch
                id="catalog-search-mobile"
                value={filters.search}
                onChange={(search) => setFilters({ ...filters, search })}
              />
            </div>

            {products.length ? (
              <ProductGrid products={products} onQuickView={setQuickView} />
            ) : (
              <EmptyState
                title="No products found"
                description="Try another keyword or browse our categories."
                action={
                  <ButtonLink to="/categories" variant="gold">
                    Browse categories
                  </ButtonLink>
                }
              />
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
        placement="bottom"
      >
        <ProductFiltersPanel
          filters={draftFilters}
          onChange={setDraftFilters}
          onClear={clearDraftFilters}
          showActions
          onApply={() => {
            setFilters(draftFilters);
            setMobileFiltersOpen(false);
          }}
        />
      </Drawer>

      <Modal
        open={!!quickView}
        onClose={() => setQuickView(null)}
        title={quickView?.name ?? 'Product'}
      >
        {quickView && <QuickViewBody product={quickView} onClose={() => setQuickView(null)} />}
      </Modal>
    </>
  );
}
