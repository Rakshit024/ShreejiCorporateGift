export function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}
export function formatPriceFrom(amount, currency = 'INR') {
    return `${formatCurrency(amount, currency)} onwards`;
}
