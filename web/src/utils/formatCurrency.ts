export function formatCurrency(
  amount: number,
  currency: 'INR' = 'INR',
  locale = 'en-IN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceFrom(amount: number, currency: 'INR' = 'INR'): string {
  return `${formatCurrency(amount, currency)} onwards`;
}

export function formatStartingFrom(amount: number, currency: 'INR' = 'INR'): string {
  return `Starting from ${formatCurrency(amount, currency)}`;
}
