import { COMPANY } from '../../data/company';
import { useQuoteCart } from '../../context/QuoteCartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { generateCartWhatsAppMessage, openWhatsApp } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../common/Button';
import { Drawer } from '../common/Drawer';
import styles from './QuoteDrawer.module.css';

interface QuoteDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QuoteDrawer({ open, onClose }: QuoteDrawerProps) {
  const {
    items,
    lineSummaries,
    estimatedTotal,
    updateQuantity,
    removeItem,
  } = useQuoteCart();

  const footer = (
    <div className={styles.footer}>
      <div className={styles.total} aria-live="polite">
        <span>Estimated total</span>
        <span>
          {estimatedTotal != null ? formatCurrency(estimatedTotal) : 'On quotation'}
        </span>
      </div>
      <p className={styles.disclaimer}>{COMPANY.pricingDisclaimer}</p>
      <div className={styles.footerActions}>
        <ButtonLink to="/quote" variant="gold" fullWidth onClick={onClose}>
          Request Quote
        </ButtonLink>
        <Button
          variant="whatsapp"
          fullWidth
          disabled={!items.length}
          onClick={() =>
            openWhatsApp(
              generateCartWhatsAppMessage(
                lineSummaries.map((l) => ({
                  productName: l.productName,
                  quantity: l.quantity,
                  branding: l.branding,
                  unitPrice: l.unitPrice,
                  lineTotal: l.lineTotal,
                })),
                estimatedTotal,
              ),
            )
          }
        >
          Send Enquiry on WhatsApp
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Quote Cart" footer={footer}>
      {!items.length ? (
        <p className={styles.empty}>Your quote cart is empty. Add products from the catalog.</p>
      ) : (
        lineSummaries.map((line) => (
          <div key={line.lineId} className={styles.item}>
            <h4>{line.productName}</h4>
            <p className={styles.meta}>Branding: {line.branding}</p>
            <div className={styles.qtyRow}>
              <button
                type="button"
                aria-label={`Decrease quantity for ${line.productName}, ${line.branding}`}
                disabled={line.quantity <= 1}
                onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                step={1}
                value={line.quantity}
                aria-label={`Quantity for ${line.productName}, ${line.branding}`}
                onChange={(e) =>
                  updateQuantity(line.lineId, Number(e.target.value) || 1)
                }
              />
              <button
                type="button"
                aria-label={`Increase quantity for ${line.productName}, ${line.branding}`}
                onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
              >
                +
              </button>
            </div>
            <p className={styles.meta}>
              {line.unitPrice != null
                ? `${formatCurrency(line.unitPrice)}/pc · ${line.lineTotal != null ? formatCurrency(line.lineTotal) : ''}`
                : 'Price on quotation'}
            </p>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${line.productName}, ${line.branding}, from quote cart`}
              onClick={() => removeItem(line.lineId)}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </Drawer>
  );
}
