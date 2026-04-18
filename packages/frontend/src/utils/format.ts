const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatCurrency(n: number): string {
  return currencyFormatter.format(n);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  // Use only the date portion (YYYY-MM-DD) to avoid doubling the time part
  // if a full ISO timestamp is passed
  const datePart = iso.includes('T') ? iso.split('T')[0] : iso;
  const date = new Date(datePart + 'T00:00:00Z');
  if (isNaN(date.getTime())) return iso; // fallback to raw string
  return dateFormatter.format(date);
}

export function formatPercent(decimal: number): string {
  return (decimal * 100).toFixed(2) + '%';
}

export function formatPaymentType(type: string): string {
  return type === 'MATURITY' ? 'Principal + Interest' : 'Interest';
}
