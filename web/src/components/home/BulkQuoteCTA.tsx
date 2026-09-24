import { COMPANY } from '../../data/company';
import { openWhatsApp, generateBulkQuoteMessage } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../common/Button';
import styles from './HomeSections.module.css';

export function BulkQuoteCTA() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.bulkBand}>
          <div>
            <h2 style={{ margin: 0, color: '#fff' }}>Bulk ordering made straightforward</h2>
            <p>{COMPANY.bulkQuoteNote}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            <ButtonLink to="/quote" variant="gold" size="lg">
              Request Bulk Quote
            </ButtonLink>
            <Button variant="whatsapp" size="lg" onClick={() => openWhatsApp(generateBulkQuoteMessage())}>
              WhatsApp for Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
