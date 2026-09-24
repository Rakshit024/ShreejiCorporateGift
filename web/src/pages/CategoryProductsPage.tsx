import { Navigate, useParams } from 'react-router-dom';
import { PageMeta } from '../components/common/PageMeta';
import { EmptyState } from '../components/common/EmptyState';
import { ButtonLink } from '../components/common/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { getCategoryBySlug } from '../data/categories';
import { getProductsByCategory } from '../data/products';
import { pageTitle } from '../config/seo';
import { Link } from 'react-router-dom';

export function CategoryProductsPage() {
  const { slug } = useParams();
  const category = slug ? getCategoryBySlug(slug) : undefined;

  if (!category) return <Navigate to="/categories" replace />;
  if (category.id === 'corporate-hampers') return <Navigate to="/hampers" replace />;
  if (category.id === 'custom-printing') return <Navigate to="/custom-branding" replace />;

  const products = getProductsByCategory(category.id);

  return (
    <>
      <PageMeta
        title={pageTitle(category.name)}
        description={category.description}
      />
      <section className="section">
        <div className="container">
          <p>
            <Link to="/categories">← All categories</Link>
          </p>
          <h1 className="section-title">{category.name}</h1>
          <p className="section-subtitle">{category.description}</p>
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <EmptyState
              title="Products coming soon"
              description="Browse our contact team for availability, alternatives and custom options."
              action={
                <ButtonLink to="/contact" variant="gold">
                  Business enquiry
                </ButtonLink>
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
