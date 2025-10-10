import React, { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { getSeriesColor } from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';

const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

export default function Donut({
  data = [],
  valueKey = 'value',
  nameKey = 'name',
  label,
  legend = true,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  innerRadius = 48,
  outerRadius = 80,
  padAngle = 2,
  className = '',
}) {
  const palette = useMemo(
    () =>
      data.map((_, index) => ({
        color: getSeriesColor(index),
      })),
    [data]
  );

  const config = useMemo(
    () => ({
      [valueKey]: {
        label: label || valueKey,
        color: palette[0]?.color,
      },
    }),
    [label, palette, valueKey]
  );

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-square', className)}
      config={config}
    >
      <PieChart>
        <AnalyticsTooltip
          indicator="line"
          valueFormatter={tooltipFormatter}
          labelFormatter={tooltipLabelFormatter}
          {...tooltipProps}
        />
        {legend ? (
          <AnalyticsLegend
            verticalAlign="bottom"
            align="center"
            {...legendProps}
          />
        ) : null}
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={padAngle}
          cornerRadius={4}
          isAnimationActive={false}
        >
          {data.map((entry, index) => {
            const fill =
              entry.color ||
              palette[index % palette.length]?.color ||
              palette[0]?.color ||
              'hsl(var(--primary))';
            return <Cell key={`${entry[nameKey] || index}`} fill={fill} />;
          })}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
