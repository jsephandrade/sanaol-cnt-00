import React, { useMemo } from 'react';
import { ChartCard, TimeSeries } from '../common';
import {
  currency,
  formatDateLabel,
  formatNumber,
  generateTicks,
} from '../common/utils';

export default function OrdersRevenueChart({ data, loading, error }) {
  const ticks = useMemo(() => generateTicks(data, 't', 6), [data]);

  const renderTooltip = (value, name, item) => (
    <div className="flex w-full items-stretch gap-2">
      <div
        className="mt-0.5 h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: item?.payload?.fill || item?.color }}
      />
      <div className="flex flex-1 justify-between leading-none">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono font-medium text-foreground">
          {name === 'Revenue' ? currency(value) : formatNumber(value)}
        </span>
      </div>
    </div>
  );

  return (
    <ChartCard
      className="col-span-1 lg:col-span-2"
      title="Orders vs Revenue"
      description="Daily orders (line) against revenue (bars)"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No transaction history available."
    >
      <TimeSeries
        data={data}
        xKey="t"
        xTicks={ticks}
        xTickFormatter={(value) =>
          formatDateLabel(value, { month: 'short', day: 'numeric' })
        }
        yAxes={[
          {
            id: 'revenue',
            orientation: 'left',
            tickFormatter: (value) => currency(value),
          },
          {
            id: 'orders',
            orientation: 'right',
            tickFormatter: (value) =>
              formatNumber(value, { maximumFractionDigits: 0 }),
          },
        ]}
        legend
        tooltipProps={{ formatter: renderTooltip }}
        series={[
          {
            key: 'revenue',
            label: 'Revenue',
            type: 'bar',
            variant: 'primary',
            yAxisId: 'revenue',
          },
          {
            key: 'orders',
            label: 'Orders',
            type: 'line',
            variant: 'secondary',
            yAxisId: 'orders',
            dot: false,
          },
        ]}
      />
    </ChartCard>
  );
}
