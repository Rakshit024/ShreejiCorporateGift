import { COMPANY } from '../data/company';
import type { BulkQuoteFormData, Product } from '../types';
import { estimateLineTotal, normalizeQuantity } from './pricing';
import { formatCurrency } from './formatCurrency';

const WA_BASE = `https://wa.me/${COMPANY.phoneE164}`;

export function buildWhatsAppUrl(message: string): string {
  return `${WA_BASE}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  } catch {
    // A popup blocker or an embedded browser may prevent the new tab.
  }
}

export function generateGeneralEnquiryMessage(): string {
  return `Hello ${COMPANY.name}, I want to know about your products.`;
}

export function generateBulkQuoteMessage(): string {
  return `Hello ${COMPANY.name}, I need a bulk quotation.`;
}

export function generateHamperQuoteMessage(hamperName?: string): string {
  const item = hamperName ?? 'Corporate Hamper';
  return `Hello ${COMPANY.name}, I am interested in ${item}. Please share your best hamper quotation.`;
}

export interface ProductEnquiryParams {
  product: Product;
  quantity: number;
  brandingLabel?: string;
  brandingOptionId?: string | null;
}

export function generateProductEnquiryMessage({
  product,
  quantity,
  brandingLabel,
  brandingOptionId,
}: ProductEnquiryParams): string {
  const branding =
    brandingLabel?.trim() ||
    (brandingOptionId
      ? product.printingOptions?.find((o) => o.id === brandingOptionId)?.label
      : 'No Printing') ||
    'Not specified';

  const normalizedQuantity = normalizeQuantity(quantity);
  const estimate = estimateLineTotal(product, normalizedQuantity, brandingOptionId ?? 'none');

  let priceLine = '';
  if (estimate.unitPrice != null && estimate.total != null) {
    priceLine = `\nEstimated: ${formatCurrency(estimate.unitPrice)}/piece. Total: ${formatCurrency(estimate.total)} (indicative).`;
  }

  return `Hello ${COMPANY.name},
I am interested in ${product.name}.
Quantity: ${normalizedQuantity}
Branding: ${branding}${priceLine}
Please share your best quotation.`;
}

export interface CartMessageLine {
  productName: string;
  quantity: number;
  branding: string;
  unitPrice: number | null;
  lineTotal?: number | null;
}

export function generateQuoteFormMessage(
  data: BulkQuoteFormData,
  cartLines: CartMessageLine[] = [],
): string {
  const lines = [
    `Name: ${data.name.trim()}`,
    data.companyName.trim() ? `Company: ${data.companyName.trim()}` : '',
    `Phone: ${data.phone.trim()}`,
    data.email.trim() ? `Email: ${data.email.trim()}` : '',
    ...(cartLines.length
      ? []
      : [`Product: ${data.product.trim()}`, `Quantity: ${data.quantity.trim()}`]),
    data.brandingRequired.trim() ? `Branding: ${data.brandingRequired.trim()}` : '',
    data.deliveryLocation.trim() ? `Delivery location: ${data.deliveryLocation.trim()}` : '',
    data.requiredDate ? `Required date: ${data.requiredDate}` : '',
    data.message.trim() ? `Message: ${data.message.trim()}` : '',
  ].filter(Boolean);

  const cartSection = cartLines.length
    ? `\n\nSelected items:\n${cartLines
        .map((line, index) => {
          const pricePart =
            line.unitPrice != null
              ? ` @ ${formatCurrency(line.unitPrice)}/pc (indicative)`
              : '';
          const totalPart =
            line.lineTotal != null ? ` · Line total: ${formatCurrency(line.lineTotal)}` : '';
          return `${index + 1}. ${line.productName} — Qty: ${line.quantity}, Branding: ${line.branding}${pricePart}${totalPart}`;
        })
        .join('\n')}`
    : '';

  return `Hello ${COMPANY.name}, I would like a bulk quotation.\n\n${lines.join('\n')}${cartSection}`;
}

export function generateCartWhatsAppMessage(
  lines: CartMessageLine[],
  estimatedTotal?: number | null,
): string {
  const body = lines
    .map((line, i) => {
      const pricePart =
        line.unitPrice != null
          ? ` @ ${formatCurrency(line.unitPrice)}/pc (indicative)`
          : '';
      const totalPart =
        line.lineTotal != null ? ` · Line total: ${formatCurrency(line.lineTotal)}` : '';
      return `${i + 1}. ${line.productName} — Qty: ${line.quantity}, Branding: ${line.branding}${pricePart}${totalPart}`;
    })
    .join('\n');

  const totalLine =
    estimatedTotal != null ? `\n\nIndicative estimated total: ${formatCurrency(estimatedTotal)}` : '';

  return `Hello ${COMPANY.name},
I would like a quotation for the following items:

${body}${totalLine}

Please share your best bulk quotation.`;
}
