import React, { useId, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { axisTickStyle, getSeriesColor, gridStyle } from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';

// Default fallback series
const DEFAULT_SERIES = [{ key: 'value', label: 'Value', variant: 'primary' }];
const DEFAULT_MARGIN = { top: 8, right: 16, bottom: 0, left: 8 };
const NON_NUMERIC_CHARS = /[^0-9.,-]+/g;

// Format number or fallback
const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

// Utility checks
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const splitKey = (key) => {
  if (typeof key !== 'string') {
    return typeof key === 'number' ? [key] : [];
  }
  return (key.match(/[^.[\]]+/g) || []).map((segment) =>
    segment.replace(/^['"]|['"]$/g, '')
  );
};

const readValue = (source, key) => {
  if (source == null || key == null) return undefined;
  if (typeof key === 'function') return key(source);
  if (typeof key !== 'string') return source?.[key];
  const segments = splitKey(key);
  if (!segments.length) return source?.[key];
  let current = source;
  for (let i = 0; i < segments.length; i += 1) {
    if (current == null) return undefined;
    current = current?.[segments[i]];
  }
  return current;
};

const writeValue = (target, key, value) => {
  if (!isPlainObject(target) || key == null || typeof key === 'function') {
    return;
  }
  if (typeof key !== 'string') {
    target[key] = value;
    return;
  }
  const segments = splitKey(key);
  if (!segments.length) {
    target[key] = value;
    return;
  }
  let cursor = target;
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (i === segments.length - 1) {
      cursor[segment] = value;
      return;
    }
    const existing = cursor[segment];
    if (isPlainObject(existing)) {
      cursor = existing;
    } else {
      cursor[segment] = {};
      cursor = cursor[segment];
    }
  }
};

/**
 * Convert various input into a safe finite number, or fallback.
 */
const toFiniteNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'bigint') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    let cleaned = trimmed.replace(NON_NUMERIC_CHARS, '');
    cleaned = cleaned.replace(/,/g, '');
    // filter out pure “.” or “-” or “-.”
    if (
      cleaned === '' ||
      cleaned === '.' ||
      cleaned === '-' ||
      cleaned === '-.'
    ) {
      return fallback;
    }
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

/**
 * Normalize category labels: ensures valid string or fallback “Item #”.
 */
const normaliseCategoryLabel = (value, index) => {
  if (value === null || value === undefined) {
    return `Item ${index + 1}`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || `Item ${index + 1}`;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : `Item ${index + 1}`;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? `Item ${index + 1}`
      : value.toISOString();
  }
  try {
    const text = String(value).trim();
    return text || `Item ${index + 1}`;
  } catch (error) {
    return `Item ${index + 1}`;
  }
};

/**
 * Sanitize margin props: ensure numeric values.
 */
const sanitizeMargin = (value) => {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_MARGIN };
  }
  const margin = { ...DEFAULT_MARGIN };
  ['top', 'right', 'bottom', 'left'].forEach((key) => {
    if (value[key] == null) return;
    const numeric =
      typeof value[key] === 'number'
        ? value[key]
        : Number.parseFloat(value[key]);
    if (Number.isFinite(numeric)) {
      margin[key] = numeric;
    }
  });
  return margin;
};

/**
 * Normalize series definitions
 */
const normaliseSeries = (series = DEFAULT_SERIES) => {
  const list = Array.isArray(series) && series.length ? series : DEFAULT_SERIES;
  return list
    .map((item, index) => {
      if (!item) return null;
      const {
        key: keyFromItem,
        dataKey,
        label,
        variant,
        color,
        gradientStops,
        fill,
        stackId,
        barSize,
        maxBarSize,
        minPointSize,
        radius,
        barProps,
        ...rest
      } = item;

      const resolvedKey = keyFromItem ?? dataKey;
      if (!resolvedKey) return null;

      const resolvedVariant = variant || `chart-${(index % 6) + 1}`;
      const resolvedColor = color || getSeriesColor(index, resolvedVariant);

      return {
        key: resolvedKey,
        readerKey: dataKey ?? resolvedKey,
        label: label ?? String(resolvedKey),
        color: resolvedColor,
        variant: resolvedVariant,
        gradientStops,
        fill,
        stackId,
        barSize,
        maxBarSize,
        minPointSize,
        radius,
        barProps: { ...rest, ...(barProps || {}) },
      };
    })
    .filter(Boolean);
};

/**
 * Build gradient defs, mapping each series key to its gradient id
 */
const buildGradients = (chartId, seriesDefs) => {
  const defs = [];
  const map = new Map();

  seriesDefs.forEach((seriesItem, index) => {
    const gradientId = `${chartId}-bar-${index}`;
    const stops = seriesItem.gradientStops || [
      { offset: '0%', stopColor: seriesItem.color, stopOpacity: 0.95 },
      { offset: '100%', stopColor: seriesItem.color, stopOpacity: 0.45 },
    ];
    defs.push({ id: gradientId, stops });
    map.set(seriesItem.key, gradientId);
  });

  return { defs, map };
};

/**
 * Convert raw data + series into cleaned chart rows and numeric values
 */
const normaliseDataset = (data, seriesDefs, xKey) => {
  if (!Array.isArray(data) || !seriesDefs.length) {
    return { rows: [], values: [] };
  }

  const rows = [];
  const numericValues = [];

  data.forEach((item, index) => {
    if (!isPlainObject(item)) {
      return;
    }

    const nextRow = { ...item };

    if (xKey) {
      const rawLabel = readValue(nextRow, xKey);
      const safeLabel = normaliseCategoryLabel(rawLabel, index);
      writeValue(nextRow, xKey, safeLabel);
    }

    seriesDefs.forEach((seriesItem) => {
      const raw = readValue(item, seriesItem.readerKey);
      const numeric = toFiniteNumber(raw, 0);
      writeValue(nextRow, seriesItem.key, numeric);
      numericValues.push(numeric);
    });

    rows.push(nextRow);
  });

  return { rows, values: numericValues };
};

/**
 * Compute a “nice” domain for numeric values, with padding.
 */
const computeDomain = (values) => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) {
    return [0, 1];
  }

  const min = Math.min(...finite);
  const max = Math.max(...finite);

  if (min === max) {
    if (min === 0) {
      return [0, 1];
    }
    if (min > 0) {
      return [0, min * 1.1];
    }
    return [min * 1.1, 0];
  }

  const span = max - min;
  const padding = span * 0.05;
  const lower = Math.min(min, 0) - padding;
  const upper = Math.max(max, 0) + padding;

  const safeLower = Number.isFinite(lower) ? lower : 0;
  const safeUpper = Number.isFinite(upper) ? upper : 1;

  if (safeLower === safeUpper) {
    return safeLower === 0
      ? [0, 1]
      : [Math.min(0, safeLower), Math.max(0, safeUpper)];
  }
  return [safeLower, safeUpper];
};

/**
 * Safely coerce a value into a usable domain array [finite, finite].
 */
const safeDomainProp = (dom) => {
  if (
    Array.isArray(dom) &&
    dom.length === 2 &&
    Number.isFinite(dom[0]) &&
    Number.isFinite(dom[1]) &&
    dom[0] < dom[1]
  ) {
    return dom;
  }
  return [0, 1];
};

/**
 * Safe tick formatter: filter out invalid ticks
 */
const safeTickFormatter = (tick) => {
  if (tick == null) return '';
  if (typeof tick === 'number') {
    return Number.isFinite(tick) ? String(tick) : '';
  }
  // If string that can parse to finite
  const num = Number(tick);
  return Number.isFinite(num) ? String(num) : '';
};

export default function BarCategory({
  data = [],
  xKey = 'name',
  series = DEFAULT_SERIES,
  stacked = false,
  legend = false,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  layout = 'vertical',
  margin = DEFAULT_MARGIN,
  className = '',
  xAxisProps = {},
  yAxisProps = {},
}) {
  const seriesDefs = useMemo(() => normaliseSeries(series), [series]);
  const { rows: chartData, values: numericValues } = useMemo(
    () => normaliseDataset(data, seriesDefs, xKey),
    [data, seriesDefs, xKey]
  );

  const numericDomain = useMemo(
    () => computeDomain(numericValues),
    [numericValues]
  );

  const computedNumericDomain = useMemo(() => {
    // defensive: ensure it's a 2-element finite domain
    const dom = Array.isArray(numericDomain) ? numericDomain : [0, 1];
    let [mn, mx] = dom;
    if (!Number.isFinite(mn)) mn = 0;
    if (!Number.isFinite(mx)) mx = 1;
    if (mn === mx) {
      if (mn === 0) {
        mx = 1;
      } else if (mn > 0) {
        mx = mn * 1.1;
      } else {
        mn = mn * 1.1;
      }
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn >= mx) {
      return [0, 1];
    }
    return [mn, mx];
  }, [numericDomain]);

  const seriesConfig = useMemo(() => {
    return seriesDefs.reduce((acc, item) => {
      acc[item.key] = { label: item.label, color: item.color };
      return acc;
    }, {});
  }, [seriesDefs]);

  const chartId = useId().replace(/:/g, '');
  const { defs: gradientDefs, map: gradientMap } = useMemo(
    () => buildGradients(chartId, seriesDefs),
    [chartId, seriesDefs]
  );

  const safeMargin = useMemo(() => sanitizeMargin(margin), [margin]);
  const isVertical = layout !== 'horizontal';
  const hasRenderableData = chartData.length > 0 && seriesDefs.length > 0;

  const {
    tick: xTick,
    tickMargin: xTickMargin,
    domain: xDomainProp,
    type: xTypeProp,
    ticks: xTicksProp,
    ...restXAxis
  } = xAxisProps || {};

  const {
    tick: yTick,
    tickMargin: yTickMargin,
    domain: yDomainProp,
    type: yTypeProp,
    ticks: yTicksProp,
    width: yWidth,
    dataKey: yDataKeyProp,
    ...restYAxis
  } = yAxisProps || {};

  // Derive safe domains
  const xDomainSafe =
    !isVertical && xDomainProp === undefined
      ? safeDomainProp(computedNumericDomain)
      : safeDomainProp(xDomainProp || computedNumericDomain);

  const yDomainSafe =
    isVertical && yDomainProp === undefined
      ? safeDomainProp(computedNumericDomain)
      : safeDomainProp(yDomainProp || computedNumericDomain);

  if (!hasRenderableData) {
    return (
      <ChartContainer
        className={cn('h-full w-full aspect-auto', className)}
        config={seriesConfig}
      >
        <div className="flex h-full min-h-[120px] w-full items-center justify-center text-sm text-muted-foreground">
          No data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-auto', className)}
      config={seriesConfig}
    >
      <BarChart
        data={chartData}
        layout={layout}
        margin={safeMargin}
        barGap={12}
        barCategoryGap="18%"
      >
        {gradientDefs.length ? (
          <defs>
            {gradientDefs.map((gradient) => (
              <linearGradient
                key={gradient.id}
                id={gradient.id}
                x1="0"
                y1="0"
                x2={isVertical ? '0' : '1'}
                y2={isVertical ? '1' : '0'}
              >
                {gradient.stops.map((stop) => (
                  <stop
                    key={`${gradient.id}-${stop.offset}`}
                    offset={stop.offset}
                    stopColor={stop.stopColor}
                    stopOpacity={stop.stopOpacity}
                  />
                ))}
              </linearGradient>
            ))}
          </defs>
        ) : null}

        <CartesianGrid
          stroke={gridStyle.stroke}
          strokeDasharray={gridStyle.strokeDasharray}
          vertical={false}
        />

        <XAxis
          dataKey={xKey}
          type={xTypeProp || (isVertical ? 'category' : 'number')}
          axisLine={false}
          tickLine={false}
          tick={{ ...axisTickStyle, ...(xTick || {}) }}
          tickMargin={xTickMargin ?? 12}
          domain={xDomainSafe}
          ticks={
            Array.isArray(xTicksProp)
              ? xTicksProp.filter((t) => Number.isFinite(Number(t)))
              : undefined
          }
          tickFormatter={safeTickFormatter}
          {...restXAxis}
        />

        <YAxis
          type={yTypeProp || (isVertical ? 'number' : 'category')}
          dataKey={isVertical ? yDataKeyProp : (yDataKeyProp ?? xKey)}
          axisLine={false}
          tickLine={false}
          tick={{ ...axisTickStyle, ...(yTick || {}) }}
          tickMargin={yTickMargin ?? 8}
          width={yWidth ?? (isVertical ? 48 : undefined)}
          domain={yDomainSafe}
          ticks={
            Array.isArray(yTicksProp)
              ? yTicksProp.filter((t) => Number.isFinite(Number(t)))
              : undefined
          }
          tickFormatter={safeTickFormatter}
          {...restYAxis}
        />

        <AnalyticsTooltip
          valueFormatter={tooltipFormatter}
          labelFormatter={tooltipLabelFormatter}
          {...tooltipProps}
        />

        {legend ? <AnalyticsLegend {...legendProps} /> : null}

        {seriesDefs.map((seriesItem, index) => {
          const stackId =
            seriesItem.stackId !== undefined
              ? seriesItem.stackId
              : stacked
                ? 'stack'
                : undefined;

          const gradientId = gradientMap.get(seriesItem.key);
          const fillColor =
            seriesItem.fill ??
            (gradientId ? `url(#${gradientId})` : seriesItem.color);

          const resolvedBarSize = toFiniteNumber(seriesItem.barSize, undefined);
          const resolvedMaxBarSize =
            toFiniteNumber(seriesItem.maxBarSize, undefined) ?? 48;

          const resolvedMinPoint =
            typeof seriesItem.minPointSize === 'function'
              ? seriesItem.minPointSize
              : toFiniteNumber(seriesItem.minPointSize, undefined);

          const radius =
            seriesItem.radius ?? (isVertical ? [12, 12, 8, 8] : [8, 12, 12, 8]);

          const barProps = { ...(seriesItem.barProps || {}) };

          if (Number.isFinite(resolvedBarSize)) {
            barProps.barSize = resolvedBarSize;
          }
          if (Number.isFinite(resolvedMaxBarSize)) {
            barProps.maxBarSize = resolvedMaxBarSize;
          }
          if (
            typeof resolvedMinPoint === 'function' ||
            Number.isFinite(resolvedMinPoint)
          ) {
            barProps.minPointSize = resolvedMinPoint;
          }

          return (
            <Bar
              key={seriesItem.key ?? index}
              dataKey={seriesItem.key}
              name={seriesItem.label}
              fill={fillColor}
              stackId={stackId}
              radius={radius}
              {...barProps}
            />
          );
        })}
      </BarChart>
    </ChartContainer>
  );
}

/**
 * Expose internals for testing / debugging
 */
export const __TEST_ONLY__ = {
  toFiniteNumber,
  normaliseDataset,
  computeDomain,
  safeDomainProp,
};
