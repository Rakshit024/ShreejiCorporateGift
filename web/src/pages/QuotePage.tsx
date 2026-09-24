import { PageMeta } from '../components/common/PageMeta';
import { QuoteForm } from '../components/quote/QuoteForm';
import { COMPANY } from '../data/company';
import { useQuoteCart } from '../context/QuoteCartContext';
import { pageTitle } from '../config/seo';
import {
  generateBulkQuoteMessage,
  generateCartWhatsAppMessage,
  openWhatsApp,
} from '../utils/whatsapp';
import { formatCurrency } from '../utils/formatCurrency';
import { Button } from '../components/common/Button';
import styles from './QuotePage.module.css';

export function QuotePage() {
  const { lineSummaries, estimatedTotal } = useQuoteCart();
  const cartLines = lineSummaries.map((line) => ({
    productName: line.productName,
    quantity: line.quantity,
    branding: line.branding,
    unitPrice: line.unitPrice,
    lineTotal: line.lineTotal,
  }));

  const openQuoteWhatsApp = () => {
    const message = lineSummaries.length
      ? generateCartWhatsAppMessage(cartLines, estimatedTotal)
      : generateBulkQuoteMessage();
    openWhatsApp(message);
  };

  return (
    <>
      <PageMeta
        title={pageTitle('Request Bulk Quote')}
        description="Submit a bulk quotation request for corporate gifts and promotional products."
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h1 className="section-title">Request Bulk Quote</h1>
          <p className="section-subtitle">{COMPANY.bulkQuoteNote}</p>

          {lineSummaries.length > 0 && (
            <aside className={styles.cartSummary} aria-labelledby="quote-cart-heading">
              <h2 id="quote-cart-heading">Items in your quote cart</h2>
              <ul className={styles.cartList}>
                {lineSummaries.map((line) => (
                  <li key={line.lineId}>
                    <div>
                      <strong>{line.productName}</strong>
                      <span>
                        Qty: {line.quantity} · Branding: {line.branding}
                      </span>
                    </div>
                    {line.lineTotal != null && <span>{formatCurrency(line.lineTotal)}</span>}
                  </li>
                ))}
              </ul>
              <div className={styles.cartTotal}>
                <span>Indicative estimated total</span>
                <strong>
                  {estimatedTotal != null ? formatCurrency(estimatedTotal) : 'On quotation'}
                </strong>
              </div>
            </aside>
          )}

          <QuoteForm cartLines={cartLines} />
          <p className={styles.whatsappHint}>
            Prefer WhatsApp?{' '}
            <Button variant="ghost" onClick={openQuoteWhatsApp}>
              Message us for a bulk quotation
            </Button>
          </p>
        </div>
      </section>
    </>
  );
}
