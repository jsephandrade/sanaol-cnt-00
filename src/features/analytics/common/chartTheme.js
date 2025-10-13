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
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'chart-6',
];

export const chartTheme = {
  paletteTokens,
  text: tokenColor('muted-foreground'),
  fontSize: {
    xs: 10,
    sm: 12,
    base: 13,
  },
  grid: {
    stroke: tokenColor('border', 0.55),
    strokeDasharray: '2 6',
  },
  axis: {
    tick: {
      fontSize: 12,
      fill: tokenColor('muted-foreground', 0.85),
    },
    label: {
      fontSize: 12,
      fill: tokenColor('muted-foreground', 0.9),
    },
  },
  tooltip: {
    backgroundColor: tokenColor('popover', 0.95),
    borderColor: tokenColor('border', 0.5),
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
