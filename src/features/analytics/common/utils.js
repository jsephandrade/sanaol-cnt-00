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

export const formatNumber = (value, options = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    ...options,
  });
  return formatter.format(number);
};

export const formatPercent = (value, total, digits = 1) => {
  const numerator = Number(value);
  const denominator = Number(total);
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    !denominator
  ) {
    return '0%';
  }
  const percent = (numerator / denominator) * 100;
  return `${percent.toFixed(digits)}%`;
};

export const formatDateLabel = (value, options = {}) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...options,
  });
  return formatter.format(date);
};

export const generateTicks = (data = [], key = 't', max = 6) => {
  if (!Array.isArray(data) || data.length <= max) {
    return data.map((item) => item?.[key]).filter(Boolean);
  }
  const step = Math.ceil(data.length / max);
  const ticks = [];
  for (let index = 0; index < data.length; index += step) {
    const value = data[index]?.[key];
    if (value) ticks.push(value);
  }
  if (ticks[ticks.length - 1] !== data[data.length - 1]?.[key]) {
    ticks.push(data[data.length - 1]?.[key]);
  }
  return ticks.filter(Boolean);
};
