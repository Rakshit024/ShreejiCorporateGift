import { products } from '../../data/products';
import { ProductGrid } from '../product/ProductGrid';
import { ButtonLink } from '../common/Button';

export function FeaturedProducts() {
  const featured = products.filter((p) => p.featured);

  return (
    <section className="section" id="featured">
      <div className="container">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-subtitle">
          Indicative starting prices — request a quotation for your quantity and branding.
        </p>
        <ProductGrid products={featured} />
        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <ButtonLink to="/products" variant="outline" size="lg">
            View full catalog
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
