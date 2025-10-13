import React, { useMemo } from 'react';
import { ChartCard, TimeSeries } from '@/features/analytics/common';
import {
  currency,
  formatDateLabel,
  generateTicks,
} from '@/features/analytics/common/utils';

const LINE_COLOR = '#f59e0b';
const ACTIVE_DOT_COLOR = '#f97316';

const formatAxisCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '';
  return `\u20b1${numeric.toLocaleString('en-PH', {
    maximumFractionDigits: 0,
  })}`;
};

const computeDomain = (points = []) => {
  if (!Array.isArray(points) || points.length === 0) {
    return ['auto', 'auto'];
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  points.forEach((item) => {
    const numeric = Number(item?.y ?? item?.value);
    if (Number.isFinite(numeric)) {
      if (numeric < min) min = numeric;
      if (numeric > max) max = numeric;
    }
  });

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return ['auto', 'auto'];
  }

  if (min === max) {
    const padding = Math.max(min * 0.25, 100);
    const lower = Math.max(0, min - padding);
    return [Math.floor(lower), Math.ceil(max + padding)];
  }

  const range = max - min;
  const padding = Math.max(range * 0.15, max * 0.08, 100);
  const lower = Math.max(0, min - padding);
  const upper = max + padding;

  return [Math.floor(lower), Math.ceil(upper)];
};

const SalesChart = ({ data, title, description }) => {
  const ticks = useMemo(() => generateTicks(data, 't', 6), [data]);
  const yDomain = useMemo(() => computeDomain(data), [data]);

  const renderActiveDot = (props = {}) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;

    const rawValue = Number(payload?.y ?? payload?.value);
    if (!Number.isFinite(rawValue)) return null;

    const label = `\u20b1${rawValue.toLocaleString('en-PH', {
      maximumFractionDigits: 0,
    })}`;
    const paddingX = 10;
    const estimatedTextWidth = Math.max(label.length * 7, 40);
    const width = estimatedTextWidth + paddingX * 2;
    const height = 28;
    const x = cx - width / 2;
    const y = cy - height - 14;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          fill="rgba(17, 24, 39, 0.85)"
          stroke="rgba(255,255,255,0.18)"
        />
        <text
          x={cx}
          y={y + height / 2 + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={12}
          fontWeight={600}
        >
          {label}
        </text>
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill="#ffffff"
          stroke={ACTIVE_DOT_COLOR}
          strokeWidth={3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={4.5}
          fill={LINE_COLOR}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      </g>
    );
  };

  const renderTooltip = (value, name, item) => (
    <div className="flex w-full items-stretch gap-2">
      <div
        className="mt-0.5 h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: item?.color || LINE_COLOR }}
      />
      <div className="flex flex-1 justify-between leading-none">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono font-medium text-foreground">
          {currency(value)}
        </span>
      </div>
    </div>
  );

  const renderTick = (value) =>
    formatDateLabel(value, {
      hour: 'numeric',
      minute: 'numeric',
    }) || value;

  const renderTooltipLabel = (_, payload) => {
    const point = payload?.[0]?.payload;
    if (!point) return '';
    return point.label || renderTick(point.t);
  };

  return (
    <ChartCard
      title={title}
      description={description}
      data={data}
      emptyMessage="No sales captured for the selected window."
      heightClass="h-[260px]"
      className="min-h-[320px]"
    >
      <TimeSeries
        data={data}
        xKey="t"
        xTicks={ticks}
        xTickFormatter={renderTick}
        xAxisProps={{
          tickMargin: 14,
          height: 42,
        }}
        tooltipFormatter={renderTooltip}
        tooltipLabelFormatter={renderTooltipLabel}
        tooltipProps={{ indicator: 'dot' }}
        margin={{ top: 36, right: 28, left: 20, bottom: 32 }}
        yAxes={[
          {
            id: 'main',
            orientation: 'left',
            tickFormatter: formatAxisCurrency,
            allowDecimals: false,
            width: 70,
            domain: yDomain,
          },
        ]}
        series={[
          {
            key: 'y',
            label: 'Revenue',
            type: 'line',
            color: LINE_COLOR,
            curve: 'monotone',
            strokeWidth: 3,
            dot: {
              r: 4.5,
              strokeWidth: 2,
              stroke: '#ffffff',
              fill: LINE_COLOR,
            },
            activeDot: renderActiveDot,
          },
        ]}
      />
    </ChartCard>
  );
};

export default SalesChart;
