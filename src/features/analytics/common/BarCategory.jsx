import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { axisTickStyle, getSeriesColor, gridStyle } from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';

const defaultSeries = [
  { key: 'value', label: 'Value', variant: 'primary', type: 'bar' },
];

const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

export default function BarCategory({
  data = [],
  xKey = 'name',
  series = defaultSeries,
  stacked = false,
  legend = false,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  layout = 'vertical',
  margin = { top: 8, right: 16, left: 8, bottom: 0 },
  className = '',
  xAxisProps = {},
  yAxisProps = {},
}) {
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

  const isVertical = layout !== 'horizontal';

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-auto', className)}
      config={config}
    >
      <BarChart data={data} layout={layout} margin={margin}>
        <CartesianGrid
          stroke={gridStyle.stroke}
          strokeDasharray={gridStyle.strokeDasharray}
        />
        <XAxis
          dataKey={xKey}
          type={isVertical ? 'category' : 'number'}
          tick={{ ...axisTickStyle, ...(xAxisProps.tick || {}) }}
          axisLine={false}
          tickLine={false}
          interval={xAxisProps.interval ?? (isVertical ? 0 : undefined)}
          angle={xAxisProps.angle}
          textAnchor={xAxisProps.textAnchor}
          height={xAxisProps.height}
          width={xAxisProps.width}
        />
        <YAxis
          type={isVertical ? 'number' : 'category'}
          dataKey={!isVertical ? xKey : undefined}
          tick={{ ...axisTickStyle, ...(yAxisProps.tick || {}) }}
          axisLine={false}
          tickLine={false}
          width={yAxisProps.width ?? (isVertical ? 48 : undefined)}
          tickFormatter={yAxisProps.tickFormatter}
        />
        <AnalyticsTooltip
          valueFormatter={tooltipFormatter}
          labelFormatter={tooltipLabelFormatter}
          {...tooltipProps}
        />
        {legend ? <AnalyticsLegend {...legendProps} /> : null}
        {series.map((item, index) => {
          const color =
            item.color || getSeriesColor(index, item.variant || 'primary');
          const stackValue =
            item.stackId !== undefined
              ? item.stackId
              : stacked
                ? 'stack'
                : undefined;
          return (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label || item.key}
              fill={item.fill || color}
              radius={item.radius ?? (isVertical ? [4, 4, 0, 0] : [0, 4, 4, 0])}
              stackId={stackValue}
              barSize={item.barSize}
              minPointSize={item.minPointSize}
            />
          );
        })}
      </BarChart>
    </ChartContainer>
  );
}
