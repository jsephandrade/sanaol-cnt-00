import React, { useMemo } from 'react';
import { ChartCard, TimeSeries } from '../common';
import { currency, formatDateLabel, generateTicks } from '../common/utils';

export default function CustomerHistoryChart({ data, loading, error }) {
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
          {currency(value)}
        </span>
      </div>
    </div>
  );

  return (
    <ChartCard
      className="col-span-1 lg:col-span-3"
      title="Purchases Over Time"
      description="Total customer spend per day"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No purchase history available."
    >
      <TimeSeries
        data={data}
        xKey="t"
        xTicks={ticks}
        xTickFormatter={(value) =>
          formatDateLabel(value, { month: 'short', day: 'numeric' })
        }
        tooltipProps={{ formatter: renderTooltip }}
        series={[
          {
            key: 'y',
            label: 'Revenue',
            type: 'line',
            variant: 'primary',
            dot: false,
          },
        ]}
      />
    </ChartCard>
  );
}
