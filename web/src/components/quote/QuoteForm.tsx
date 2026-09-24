import { useState, type FormEvent } from 'react';
import type { BulkQuoteFormData } from '../../types';
import { products } from '../../data/products';
import {
  generateQuoteFormMessage,
  openWhatsApp,
  type CartMessageLine,
} from '../../utils/whatsapp';
import { Button } from '../common/Button';
import styles from './QuoteForm.module.css';

const initial: BulkQuoteFormData = {
  name: '',
  companyName: '',
  phone: '',
  email: '',
  product: '',
  quantity: '',
  brandingRequired: '',
  deliveryLocation: '',
  requiredDate: '',
  message: '',
};

type Errors = Partial<Record<keyof BulkQuoteFormData, string>>;

function hasPositiveQuantity(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/,/g, '');
  const validFormat = /^(?:approx\.?\s*)?\d+(?:\s*[-–]\s*\d+)?(?:\s*(?:pcs?|pieces?|units?|approx\.?|\+))?$/;
  if (!validFormat.test(normalized)) return false;

  const numbers = normalized.match(/\d+/g)?.map(Number);
  if (!numbers?.length || numbers.some((number) => !Number.isFinite(number) || number <= 0)) {
    return false;
  }
  const first = numbers[0];
  const second = numbers[1];
  return second === undefined || (first !== undefined && first <= second);
}

function todayInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function validate(data: BulkQuoteFormData, hasCartLines: boolean): Errors {
  const errors: Errors = {};
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.phone.trim()) {
    errors.phone = 'Phone is required';
  } else {
    const phone = data.phone.trim();
    const digits = phone.replace(/\D/g, '');
    if (!/^[\d+\s-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = 'Enter a valid phone number';
    }
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email';
  }
  if (!hasCartLines && !data.product.trim()) errors.product = 'Product is required';
  if (!hasCartLines && !data.quantity.trim()) {
    errors.quantity = 'Quantity is required';
  } else if (!hasCartLines && !hasPositiveQuantity(data.quantity)) {
    errors.quantity = 'Enter a quantity greater than zero';
  }
  if (data.requiredDate && data.requiredDate < todayInputValue()) {
    errors.requiredDate = 'Required date cannot be in the past';
  }
  return errors;
}

function getInitialData(cartLines: CartMessageLine[]): BulkQuoteFormData {
  const firstLine = cartLines[0];
  return {
    ...initial,
    product: firstLine?.productName ?? '',
    quantity: firstLine ? String(firstLine.quantity) : '',
  };
}

export function QuoteForm({ cartLines = [] }: { cartLines?: CartMessageLine[] }) {
  const initialData = getInitialData(cartLines);
  const [data, setData] = useState<BulkQuoteFormData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof BulkQuoteFormData, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(data, cartLines.length > 0);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    openWhatsApp(generateQuoteFormMessage(data, cartLines));
    setSubmitted(true);
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <strong>Thank you — your quote request is ready.</strong>
        <p style={{ margin: '0.5rem 0 0' }}>
          A WhatsApp window has been requested with your details. Send the pre-filled message to
          receive a quotation. If no new window appeared, use the WhatsApp button on this page.
        </p>
        <Button variant="outline" style={{ marginTop: '1rem' }} onClick={reset}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form className={`${styles.form} ${styles.card}`} onSubmit={onSubmit} noValidate>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="quote-name">Name *</label>
          <input
            id="quote-name"
            value={data.name}
            onChange={(event) => update('name', event.target.value)}
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'quote-name-error' : undefined}
          />
          {errors.name && <p role="alert" className={styles.error} id="quote-name-error">{errors.name}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="quote-company">Company Name</label>
          <input
            id="quote-company"
            value={data.companyName}
            onChange={(event) => update('companyName', event.target.value)}
            autoComplete="organization"
          />
        </div>
      </div>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="quote-phone">Phone *</label>
          <input
            id="quote-phone"
            type="tel"
            value={data.phone}
            onChange={(event) => update('phone', event.target.value)}
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'quote-phone-error' : undefined}
          />
          {errors.phone && <p role="alert" className={styles.error} id="quote-phone-error">{errors.phone}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="quote-email">Email</label>
          <input
            id="quote-email"
            type="email"
            value={data.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'quote-email-error' : undefined}
          />
          {errors.email && <p role="alert" className={styles.error} id="quote-email-error">{errors.email}</p>}
        </div>
      </div>
      {cartLines.length === 0 && (
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="quote-product">Product *</label>
            <select
              id="quote-product"
              value={data.product}
              onChange={(event) => update('product', event.target.value)}
              required
              aria-invalid={Boolean(errors.product)}
              aria-describedby={errors.product ? 'quote-product-error' : undefined}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
              <option value="Corporate Hamper">Corporate Hamper</option>
              <option value="Custom / Other">Custom / Other</option>
            </select>
            {errors.product && (
              <p role="alert" className={styles.error} id="quote-product-error">{errors.product}</p>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="quote-qty">Quantity *</label>
            <input
              id="quote-qty"
              value={data.quantity}
              onChange={(event) => update('quantity', event.target.value)}
              placeholder="e.g. 500 or 500–1000"
              inputMode="numeric"
              required
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={errors.quantity ? 'quote-qty-error' : undefined}
            />
            {errors.quantity && (
              <p role="alert" className={styles.error} id="quote-qty-error">{errors.quantity}</p>
            )}
          </div>
        </div>
      )}
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="quote-branding">Branding Required</label>
          <input
            id="quote-branding"
            value={data.brandingRequired}
            onChange={(event) => update('brandingRequired', event.target.value)}
            placeholder="Logo, colours, print area…"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="quote-location">Delivery Location</label>
          <input
            id="quote-location"
            value={data.deliveryLocation}
            onChange={(event) => update('deliveryLocation', event.target.value)}
            autoComplete="address-level2"
          />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="quote-date">Required Date</label>
        <input
          id="quote-date"
          type="date"
          min={todayInputValue()}
          value={data.requiredDate}
          onChange={(event) => update('requiredDate', event.target.value)}
          aria-invalid={Boolean(errors.requiredDate)}
          aria-describedby={errors.requiredDate ? 'quote-date-error' : undefined}
        />
        {errors.requiredDate && (
          <p role="alert" className={styles.error} id="quote-date-error">{errors.requiredDate}</p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="quote-message">Message</label>
        <textarea
          id="quote-message"
          value={data.message}
          onChange={(event) => update('message', event.target.value)}
        />
      </div>
      <Button variant="gold" size="lg" type="submit">
        Request Bulk Quote
      </Button>
    </form>
  );
}
