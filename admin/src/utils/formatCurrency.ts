export function formatCurrency(amount: number, currency: 'INR' = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceFrom(amount: number, currency: 'INR' = 'INR'): string {
  return `${formatCurrency(amount, currency)} onwards`;
}