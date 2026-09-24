import { Link } from 'react-router-dom';
import { hampers } from '../../data/hampers';
import { generateHamperQuoteMessage, openWhatsApp } from '../../utils/whatsapp';
import { formatStartingFrom } from '../../utils/formatCurrency';
import { Button } from '../common/Button';
import { ProductImage } from '../product/ProductImage';
import styles from './HomeSections.module.css';

export function HampersSection({ compact }: { compact?: boolean }) {
  const list = compact ? hampers.slice(0, 1) : hampers;

  return (
    <section className="section" id="hampers-preview">
      <div className="container">
        <h2 className="section-title">Corporate Hampers</h2>
        <p className="section-subtitle">
          Thoughtful combinations for clients, employees and festivals.
        </p>
        <div className={styles.hamperGrid}>
          {list.map((hamper) => (
            <article key={hamper.id} className={styles.hamperCard}>
              <ProductImage src={hamper.image} alt={hamper.name} />
              <div className={styles.hamperBody}>
                <h3 style={{ margin: 0, color: 'var(--color-navy)' }}>{hamper.name}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {hamper.description}
                </p>
                {hamper.placeholder && (
                  <span className={styles.placeholderNote}>Customize contents and pricing on enquiry</span>
                )}
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {hamper.priceFrom != null
                    ? formatStartingFrom(hamper.priceFrom)
                    : 'Price on enquiry'}
                </p>
                <Button
                  variant="gold"
                  fullWidth
                  onClick={() => openWhatsApp(generateHamperQuoteMessage(hamper.name))}
                >
                  Ask for Hamper Quote
                </Button>
              </div>
            </article>
          ))}
        </div>
        {compact && (
          <div style={{ marginTop: '1rem' }}>
            <Link to="/hampers">View hampers →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
