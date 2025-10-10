import React, { useMemo } from 'react';
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
  margin = { top: 8, right: 16, left: 8, bottom: 0 },
  className = '',
}) {
  const resolvedAxes = yAxes.length ? yAxes : defaultAxes;
  const defaultAxisId = resolvedAxes[0]?.id ?? 'main';

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

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-auto', className)}
      config={config}
    >
      <ComposedChart data={data} margin={margin}>
        {showGrid ? (
          <CartesianGrid
            stroke={gridStyle.stroke}
            strokeDasharray={gridStyle.strokeDasharray}
          />
        ) : null}
        <XAxis
          dataKey={xKey}
          tick={{ ...axisTickStyle, ...(xAxisProps.tick || {}) }}
          axisLine={false}
          tickLine={false}
          minTickGap={xAxisProps.minTickGap ?? 24}
          ticks={computedTicks}
          tickFormatter={xTickFormatter}
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
          const variantToken = item.variant || 'primary';
          const color =
            item.color || getSeriesColor(index, item.variant || variantToken);
          const axisId = item.yAxisId || defaultAxisId;
          const common = {
            key: item.key,
            dataKey: item.key,
            yAxisId: axisId,
            stroke: color,
            strokeWidth: item.strokeWidth ?? 1.5,
            name: item.label || item.key,
          };

          if (item.type === 'line') {
            return (
              <Line
                {...common}
                type={item.curve || 'monotone'}
                dot={item.dot ?? false}
                activeDot={
                  item.activeDot === undefined ? { r: 3 } : item.activeDot
                }
              />
            );
          }

          if (item.type === 'bar') {
            return (
              <Bar
                {...common}
                fill={color}
                radius={item.radius ?? [4, 4, 0, 0]}
                barSize={item.barSize}
                stackId={item.stackId}
              />
            );
          }

          return (
            <Area
              {...common}
              type={item.curve || 'monotone'}
              fill={
                item.fill ||
                getFillColor(variantToken, item.fillOpacity ?? 0.16)
              }
              activeDot={item.activeDot ?? { r: 3 }}
            />
          );
        })}
      </ComposedChart>
    </ChartContainer>
  );
}
