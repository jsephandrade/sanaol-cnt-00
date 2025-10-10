export const currency = (value) =>
  `\u20b1${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

export const formatMethodLabel = (method) =>
  (method || 'Unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
