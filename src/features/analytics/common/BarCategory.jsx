import React, { useId, useMemo } from 'react';
import { ResponsiveBar } from '@/components/charts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { axisTickStyle, getSeriesColor, gridStyle } from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';

/** ----------------- your existing helpers (kept as-is) ----------------- */

const DEFAULT_SERIES = [{ key: 'value', label: 'Value', variant: 'primary' }];
const DEFAULT_MARGIN = { top: 8, right: 16, bottom: 0, left: 8 };
const NON_NUMERIC_CHARS = /[^0-9.,-]+/g;

const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

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
  if (!isPlainObject(target) || key == null || typeof key === 'function')
    return;
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

const toFiniteNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'bigint') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    let cleaned = trimmed.replace(NON_NUMERIC_CHARS, '');
    cleaned = cleaned.replace(/,/g, '');
    if (
      cleaned === '' ||
      cleaned === '.' ||
      cleaned === '-' ||
      cleaned === '-.'
    )
      return fallback;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normaliseCategoryLabel = (value, index) => {
  if (value === null || value === undefined) return `Item ${index + 1}`;
  if (typeof value === 'string') return value.trim() || `Item ${index + 1}`;
  if (typeof value === 'number')
    return Number.isFinite(value) ? String(value) : `Item ${index + 1}`;
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? `Item ${index + 1}`
      : value.toISOString();
  try {
    const text = String(value).trim();
    return text || `Item ${index + 1}`;
  } catch {
    return `Item ${index + 1}`;
  }
};

const sanitizeMargin = (value) => {
  if (!value || typeof value !== 'object') return { ...DEFAULT_MARGIN };
  const margin = { ...DEFAULT_MARGIN };
  ['top', 'right', 'bottom', 'left'].forEach((key) => {
    if (value[key] == null) return;
    const numeric =
      typeof value[key] === 'number'
        ? value[key]
        : Number.parseFloat(value[key]);
    if (Number.isFinite(numeric)) margin[key] = numeric;
  });
  return margin;
};

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
        radius, // we’ll map to borderRadius globally
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
        radius,
        barProps: { ...rest, ...(barProps || {}) },
      };
    })
    .filter(Boolean);
};

const buildGradients = (chartId, seriesDefs) => {
  const defs = [];
  const map = new Map();

  seriesDefs.forEach((seriesItem, index) => {
    const gradientId = `${chartId}-bar-${index}`;
    const stops = seriesItem.gradientStops || [
      { offset: 0, stopColor: seriesItem.color, stopOpacity: 0.95 },
      { offset: 1, stopColor: seriesItem.color, stopOpacity: 0.45 },
    ];
    defs.push({
      id: gradientId,
      type: 'linearGradient',
      colors: stops.map((s) => ({
        offset: s.offset, // 0..1 for Nivo
        color: s.stopColor,
        opacity: s.stopOpacity,
      })),
    });
    map.set(seriesItem.key, gradientId);
  });

  return { defs, map };
};

const normaliseDataset = (data, seriesDefs, xKey) => {
  if (!Array.isArray(data) || !seriesDefs.length) {
    return { rows: [], values: [] };
  }
  const rows = [];
  const numericValues = [];

  data.forEach((item, index) => {
    if (!isPlainObject(item)) return;

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

const computeDomain = (values) => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) return [0, 1];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) {
    if (min === 0) return [0, 1];
    if (min > 0) return [0, min * 1.1];
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

const safeTickFormatter = (tick) => {
  if (tick == null) return '';
  if (typeof tick === 'number')
    return Number.isFinite(tick) ? String(tick) : '';
  const num = Number(tick);
  return Number.isFinite(num) ? String(num) : '';
};

/** ----------------- Nivo BarCategory ----------------- */

export default function BarCategoryNivo({
  data = [],
  xKey = 'name',
  series = DEFAULT_SERIES,
  stacked = false,
  legend = false,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  layout = 'vertical', // 'vertical' (default) or 'horizontal'
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
    const dom = Array.isArray(numericDomain) ? numericDomain : [0, 1];
    let [mn, mx] = dom;
    if (!Number.isFinite(mn)) mn = 0;
    if (!Number.isFinite(mx)) mx = 1;
    if (mn === mx) {
      if (mn === 0) mx = 1;
      else if (mn > 0) mx = mn * 1.1;
      else mn = mn * 1.1;
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn >= mx) return [0, 1];
    return [mn, mx];
  }, [numericDomain]);

  const seriesConfig = useMemo(
    () =>
      seriesDefs.reduce((acc, item) => {
        acc[item.key] = { label: item.label, color: item.color };
        return acc;
      }, {}),
    [seriesDefs]
  );

  const chartId = useId().replace(/:/g, '');
  const { defs: gradientDefs, map: gradientMap } = useMemo(
    () => buildGradients(chartId, seriesDefs),
    [chartId, seriesDefs]
  );

  const safeMargin = useMemo(() => sanitizeMargin(margin), [margin]);
  const isVertical = layout !== 'horizontal';
  const hasRenderableData = chartData.length > 0 && seriesDefs.length > 0;

  // Axis props mapping
  const { tickMargin: xTickMargin, ticks: xTicksProp, ...restXAxis } =
    xAxisProps || {};

  const { tickMargin: yTickMargin, width: yWidth, ...restYAxis } =
    yAxisProps || {};

  // Derive safe domains for the numeric axis
  const valueDomain = safeDomainProp(computedNumericDomain);

  // Nivo expects:
  // - data: array of { [xKey]: indexLabel, [key1]: number, [key2]: number, ... }
  // - keys: string[]
  const keys = seriesDefs.map((s) => s.key);

  // Colors: use gradient defs if present, otherwise solid colors per key
  const hasGradients = gradientDefs.length > 0;
  const fillRules = hasGradients
    ? keys.map((k) => ({ match: { id: k }, id: gradientMap.get(k) }))
    : [];

  const colorByKey = new Map(seriesDefs.map((s) => [s.key, s.color]));

  // Custom tooltip that reuses your formatters
  const CustomTooltip = (nivo) => {
    const rawLabel =
      typeof tooltipLabelFormatter === 'function'
        ? tooltipLabelFormatter(nivo.indexValue, nivo.data)
        : nivo.indexValue;

    const resolvedFormatter =
      tooltipProps?.formatter ||
      (typeof tooltipFormatter === 'function'
        ? (value, name, item, index, payload) =>
            tooltipFormatter(value, name, payload || item?.payload)
        : undefined);

    const payloadEntry = {
      dataKey: nivo.id,
      name: seriesConfig[nivo.id]?.label ?? String(nivo.id),
      value: nivo.value,
      color: nivo.color,
      payload: {
        ...nivo.data,
        fill: nivo.color,
      },
    };

    if (AnalyticsTooltip) {
      return (
        <AnalyticsTooltip
          active
          {...tooltipProps}
          payload={[payloadEntry]}
          label={rawLabel}
          formatter={resolvedFormatter}
        />
      );
    }

    const formattedValue = resolvedFormatter
      ? resolvedFormatter(
          payloadEntry.value,
          payloadEntry.name,
          payloadEntry,
          0,
          payloadEntry.payload
        )
      : payloadEntry.value;

    return (
      <div
        style={{
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)',
          padding: '6px 8px',
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        <div style={{ opacity: 0.7, marginBottom: 4 }}>{rawLabel}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              background: nivo.color,
              borderRadius: 2,
            }}
          />
          <span>
            {payloadEntry.name}: {formattedValue}
          </span>
        </div>
      </div>
    );
  };

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
      {legend ? <AnalyticsLegend {...legendProps} /> : null}

      <div style={{ height: '100%', width: '100%', minHeight: 120 }}>
        <ResponsiveBar
          data={chartData}
          keys={keys}
          indexBy={xKey}
          groupMode={stacked ? 'stacked' : 'grouped'}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={safeMargin}
          padding={0.25} // spacing between bars
          innerPadding={6} // spacing within groups
          indexScale={{ type: 'band', round: true }}
          valueScale={{
            type: 'linear',
            min: valueDomain[0],
            max: valueDomain[1],
          }}
          // Grids (match your theme-ish)
          enableGridX={!isVertical}
          enableGridY={isVertical}
          gridXValues={isVertical ? undefined : xTicksProp || undefined}
          gridYValues={isVertical ? xTicksProp || undefined : undefined}
          // Colors
          colors={(bar) => {
            if (hasGradients) return undefined; // use defs/fill rules
            return colorByKey.get(bar.id) || bar.color;
          }}
          defs={hasGradients ? gradientDefs : undefined}
          fill={hasGradients ? fillRules : undefined}
          // Rounded corners (approximate your radius defaults)
          borderRadius={isVertical ? 4 : 4}
          // Axes
          axisBottom={
            isVertical
              ? {
                  tickSize: 0,
                  tickPadding: xTickMargin ?? 12,
                  tickRotation: 0,
                  format: (v) => safeTickFormatter(v),
                  ...axisTickStyle,
                  ...restXAxis,
                }
              : {
                  tickSize: 0,
                  tickPadding: xTickMargin ?? 12,
                  tickRotation: 0,
                  format: (v) => safeTickFormatter(v),
                  ...axisTickStyle,
                  ...restXAxis,
                }
          }
          axisLeft={
            isVertical
              ? {
                  tickSize: 0,
                  tickPadding: yTickMargin ?? 8,
                  tickRotation: 0,
                  format: (v) => safeTickFormatter(v),
                  ...(yWidth ? { legendOffset: yWidth } : {}),
                  ...axisTickStyle,
                  ...restYAxis,
                }
              : {
                  tickSize: 0,
                  tickPadding: yTickMargin ?? 8,
                  tickRotation: 0,
                  format: (v) => safeTickFormatter(v),
                  ...(yWidth ? { legendOffset: yWidth } : {}),
                  ...axisTickStyle,
                  ...restYAxis,
                }
          }
          // Labels on bars
          enableLabel={false}
          // Tooltip
          tooltip={CustomTooltip}
          // Role / a11y
          role="img"
          ariaLabel="Bar chart"
          // Animate
          animate={true}
          motionConfig="gentle"
          // Theme hooks (line/grid colors)
          theme={{
            grid: {
              line: {
                stroke: gridStyle.stroke,
                strokeDasharray: gridStyle.strokeDasharray,
              },
            },
            axis: {
              ticks: {
                text: {
                  // map your tick font props as needed
                  fontSize: axisTickStyle?.fontSize ?? 12,
                },
              },
            },
          }}
        />
      </div>
    </ChartContainer>
  );
}

/** expose internals for tests if you need them */
export const __TEST_ONLY__ = {
  toFiniteNumber,
  normaliseDataset,
  computeDomain,
  safeDomainProp,
};

export { toFiniteNumber, computeDomain };
