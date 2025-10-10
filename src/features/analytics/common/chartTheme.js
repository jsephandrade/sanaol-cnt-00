const normalizeToken = (token) =>
  String(token || '')
    .trim()
    .replace(/^var\(--/, '')
    .replace(/\)$/, '');

const tokenColor = (token, alpha) => {
  const normalized = normalizeToken(token);
  if (!normalized) return 'hsl(var(--muted-foreground))';
  if (alpha == null) {
    return `hsl(var(--${normalized}))`;
  }
  return `hsl(var(--${normalized}) / ${alpha})`;
};

const paletteTokens = [
  'primary',
  'accent',
  'secondary',
  'primary-dark',
  'destructive',
  'muted-foreground',
];

export const chartTheme = {
  paletteTokens,
  text: tokenColor('muted-foreground'),
  fontSize: {
    xs: 10,
    sm: 11,
    base: 12,
  },
  grid: {
    stroke: `hsl(var(--border) / 0.35)`,
    strokeDasharray: '3 3',
  },
  axis: {
    tick: {
      fontSize: 11,
      fill: tokenColor('muted-foreground'),
    },
    label: {
      fontSize: 12,
      fill: tokenColor('muted-foreground'),
    },
  },
  tooltip: {
    backgroundColor: tokenColor('popover'),
    borderColor: tokenColor('border'),
    color: tokenColor('popover-foreground'),
  },
};

export const getSeriesColor = (index = 0, tokenOverride) => {
  if (tokenOverride) {
    return tokenColor(tokenOverride);
  }
  const token = paletteTokens[index % paletteTokens.length] || paletteTokens[0];
  return tokenColor(token);
};

export const getFillColor = (token = 'primary', alpha = 0.12) =>
  tokenColor(token, alpha);

export const axisTickStyle = chartTheme.axis.tick;
export const axisLabelStyle = chartTheme.axis.label;
export const gridStyle = chartTheme.grid;

export default chartTheme;
