import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageMeta } from '../components/common/PageMeta';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PricingTable } from '../components/product/PricingTable';
import { ProductImage } from '../components/product/ProductImage';
import { COMPANY } from '../data/company';
import { useQuoteCart } from '../context/QuoteCartContext';
import { useProduct } from '../hooks/useProducts';
import { pageTitle } from '../config/seo';
import type { Product } from '../types';
import { formatCurrency, formatPriceFrom } from '../utils/formatCurrency';
import { estimateLineTotal, normalizeQuantity } from '../utils/pricing';
import { generateProductEnquiryMessage, openWhatsApp } from '../utils/whatsapp';
import styles from './ProductDetailsPage.module.css';

export function ProductDetailsPage() {
  const { slug } = useParams();
  const product = useProduct(slug);

  if (!product) return <Navigate to="/products" replace />;
  return <ProductDetailsContent key={product.id} product={product} />;
}

function ProductDetailsContent({ product }: { product: Product }) {
  const { addItem } = useQuoteCart();
  const [quantity, setQuantity] = useState(product.pricingSlabs?.length ? 100 : 1);
  const [brandingId, setBrandingId] = useState('none');
  const images = product.images?.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(0);

  const selectedBrandingId = product.printingOptions?.some((option) => option.id === brandingId)
    ? brandingId
    : 'none';
  const brandingOption =
    product.printingOptions?.find((option) => option.id === selectedBrandingId) ??
    product.printingOptions?.[0];
  const selectedImageIndex = Math.min(activeImage, Math.max(0, images.length - 1));
  const selectedImage = images[selectedImageIndex] ?? product.image;
  const estimate = estimateLineTotal(product, quantity, selectedBrandingId);

  return (
    <>
      <PageMeta
        title={pageTitle(product.name)}
        description={product.shortDescription}
      />
      <div className={`container ${styles.page}`}>
        <p style={{ marginBottom: '1rem' }}>
          <Link to="/products">← Back to catalog</Link>
        </p>
        <div className={styles.grid}>
          <div>
            <div className={styles.galleryMain}>
              <ProductImage src={selectedImage} alt={product.name} priority />
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs} role="list" aria-label="Product images">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`${styles.thumb} ${i === selectedImageIndex ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === selectedImageIndex}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <span className={styles.category}>{product.category}</span>
            <h1>{product.name}</h1>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {product.customizable && <Badge variant="gold">Custom Branding</Badge>}
              {product.bulkPricing && <Badge variant="navy">Bulk Pricing</Badge>}
              {!product.available && <Badge variant="outline">Currently unavailable</Badge>}
            </div>
            <p className={styles.price}>{formatPriceFrom(product.priceFrom, product.currency)}</p>
            <p>{product.description}</p>

            {product.pricingSlabs && product.pricingSlabs.length > 0 && (
              <>
                <h2 style={{ color: 'var(--color-navy)' }}>Quantity-wise price</h2>
                <PricingTable slabs={product.pricingSlabs} activeQuantity={quantity} />
              </>
            )}

            <label htmlFor="product-qty">
              <strong>Select quantity</strong>
            </label>
            <div className={styles.qty}>
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => setQuantity((current) => normalizeQuantity(current - 1))}
              >
                −
              </button>
              <input
                id="product-qty"
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(normalizeQuantity(Number(event.target.value)))}
              />
              <button
                type="button"
                aria-label="Increase"
                onClick={() => setQuantity((current) => normalizeQuantity(current + 1))}
              >
                +
              </button>
            </div>

            {product.printingOptions && product.printingOptions.length > 0 && (
              <>
                <strong>Logo printing</strong>
                <div className={styles.printOptions} role="radiogroup" aria-label="Logo printing">
                  {product.printingOptions.map((opt) => (
                    <label key={opt.id}>
                      <input
                        type="radio"
                        name="printing"
                        value={opt.id}
                        checked={selectedBrandingId === opt.id}
                        onChange={() => setBrandingId(opt.id)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </>
            )}
            {product.customizable && !product.printingOptions?.length && (
              <p className={styles.note}>Custom logo artwork and branding are available on enquiry.</p>
            )}

            <div className={styles.totalBox} aria-live="polite">
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Estimated total
              </span>
              <strong>
                {estimate.total != null ? formatCurrency(estimate.total) : 'Available on enquiry'}
              </strong>
            </div>

            <div className={styles.actions}>
              <Button
                variant="gold"
                disabled={!product.available}
                onClick={() =>
                  addItem({
                    productId: product.id,
                    quantity,
                    brandingOptionId: selectedBrandingId,
                    brandingLabel: brandingOption?.label ?? 'No Printing',
                  })
                }
              >
                {product.available ? 'Add to Quote' : 'Unavailable'}
              </Button>
              <Button
                variant="whatsapp"
                onClick={() =>
                  openWhatsApp(
                    generateProductEnquiryMessage({
                      product,
                      quantity,
                      brandingOptionId: selectedBrandingId,
                      brandingLabel: brandingOption?.label,
                    }),
                  )
                }
              >
                <MessageCircle size={18} /> WhatsApp Enquiry
              </Button>
            </div>
            <p className={styles.note}>{COMPANY.pricingDisclaimer}</p>
          </div>
        </div>

        <section className={styles.specSection} aria-labelledby="product-info-heading">
          <h2 id="product-info-heading">Product Information</h2>
          <table className={styles.specTable}>
            <caption className="visually-hidden">Product specifications</caption>
            <tbody>
              {product.specifications.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
