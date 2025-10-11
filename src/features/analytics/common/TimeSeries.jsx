import React, { useId, useMemo } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import {
  axisTickStyle,
  getFillColor,
  getSeriesColor,
  gridStyle,
} from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';

const defaultSeries = [
  { key: 'value', label: 'Value', type: 'area', variant: 'primary' },
];

const defaultAxes = [{ id: 'main', orientation: 'left' }];

const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

export default function TimeSeries({
  data = [],
  series = defaultSeries,
  xKey = 't',
  xTickFormatter,
  xTicks,
  xAxisProps = {},
  yAxes = defaultAxes,
  legend = false,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  showGrid = true,
  margin = { top: 16, right: 24, left: 12, bottom: 12 },
  className = '',
}) {
  const {
    tick: providedXAxisTick = {},
    minTickGap: providedMinTickGap = 24,
    ...restXAxisProps
  } = xAxisProps;
  const resolvedAxes = yAxes.length ? yAxes : defaultAxes;
  const defaultAxisId = resolvedAxes[0]?.id ?? 'main';
  const rawChartId = useId();
  const chartId = rawChartId.replace(/:/g, '');

  const config = useMemo(
    () =>
      series.reduce((acc, item, index) => {
        const color = item.color || getSeriesColor(index, item.variant);
        acc[item.key] = {
          label: item.label || item.key,
          color,
        };
        return acc;
      }, {}),
    [series]
  );

  const computedTicks = useMemo(() => {
    if (Array.isArray(xTicks) && xTicks.length) return xTicks;
    return undefined;
  }, [xTicks]);

  const { areaDefs, areaFillMap } = useMemo(() => {
    const defs = [];
    const map = new Map();
    series.forEach((item, index) => {
      if (item.type !== 'area') return;
      const variantToken = item.variant || 'chart-1';
      const color = item.color || getSeriesColor(index, variantToken);
      const gradientId = `${chartId}-gradient-${index}`;
      const stops = item.gradientStops || [
        { offset: '0%', stopColor: color, stopOpacity: 0.45 },
        { offset: '55%', stopColor: color, stopOpacity: 0.25 },
        { offset: '100%', stopColor: color, stopOpacity: 0 },
      ];
      defs.push({ id: gradientId, stops });
      map.set(item.key || `series-${index}`, gradientId);
    });
    return { areaDefs: defs, areaFillMap: map };
  }, [series, chartId]);

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-auto', className)}
      config={config}
    >
      <ComposedChart data={data} margin={margin}>
        {areaDefs.length ? (
          <defs>
            {areaDefs.map((gradient) => (
              <linearGradient
                key={gradient.id}
                id={gradient.id}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
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
        {showGrid ? (
          <CartesianGrid
            stroke={gridStyle.stroke}
            strokeDasharray={gridStyle.strokeDasharray}
            vertical={false}
          />
        ) : null}
        <XAxis
          dataKey={xKey}
          tick={{ ...axisTickStyle, ...providedXAxisTick }}
          axisLine={false}
          tickLine={false}
          minTickGap={providedMinTickGap}
          ticks={computedTicks}
          tickFormatter={xTickFormatter}
          {...restXAxisProps}
        />
        {resolvedAxes.map((axis) => (
          <YAxis
            key={axis.id || axis.orientation || 'axis'}
            yAxisId={axis.id ?? defaultAxisId}
            orientation={axis.orientation ?? 'left'}
            tick={{
              ...axisTickStyle,
              ...(axis.tick || {}),
            }}
            axisLine={false}
            tickLine={false}
            width={axis.width ?? 48}
            domain={axis.domain}
            allowDecimals={axis.allowDecimals ?? true}
            tickFormatter={axis.tickFormatter}
          />
        ))}
        <AnalyticsTooltip
          valueFormatter={tooltipFormatter}
          labelFormatter={tooltipLabelFormatter}
          {...tooltipProps}
        />
        {legend ? <AnalyticsLegend {...legendProps} /> : null}
        {series.map((item, index) => {
          const variantToken = item.variant || 'chart-1';
          const color =
            item.color || getSeriesColor(index, item.variant || variantToken);
          const axisId = item.yAxisId || defaultAxisId;
          const seriesKey =
            item.reactKey || item.key || `series-${index.toString()}`;
          const baseProps = {
            dataKey: item.key,
            yAxisId: axisId,
            stroke: color,
            name: item.label || item.key,
          };

          if (item.type === 'line') {
            return (
              <Line
                key={seriesKey}
                {...baseProps}
                type={item.curve || 'monotone'}
                strokeWidth={item.strokeWidth ?? 2.2}
                strokeLinecap={item.strokeLinecap ?? 'round'}
                dot={item.dot ?? false}
                activeDot={
                  item.activeDot === undefined
                    ? { r: 4, strokeWidth: 0 }
                    : item.activeDot
                }
              />
            );
          }

          if (item.type === 'bar') {
            return (
              <Bar
                key={seriesKey}
                {...baseProps}
                fill={item.fill || color}
                radius={item.radius ?? [10, 10, 6, 6]}
                barSize={item.barSize}
                maxBarSize={item.maxBarSize ?? 48}
                stackId={item.stackId}
              />
            );
          }

          const gradientKey = item.key || `series-${index}`;
          const gradientId = areaFillMap.get(gradientKey);

          return (
            <Area
              key={seriesKey}
              {...baseProps}
              type={item.curve || 'monotone'}
              strokeWidth={item.strokeWidth ?? 2}
              strokeOpacity={item.strokeOpacity ?? 0.9}
              fill={
                item.fill ||
                (gradientId
                  ? `url(#${gradientId})`
                  : getFillColor(variantToken, item.fillOpacity ?? 0.22))
              }
              activeDot={item.activeDot ?? { r: 4 }}
            />
          );
        })}
      </ComposedChart>
    </ChartContainer>
  );
}
