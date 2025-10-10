import React, { useMemo } from 'react';
import { ChartCard, TimeSeries, BarCategory } from '../common';
import { currency, formatDateLabel, generateTicks } from '../common/utils';

export default function SalesTrendCharts({ dailyData, monthlyData, loading }) {
  const dailyTicks = useMemo(
    () => generateTicks(dailyData, 't', 6),
    [dailyData]
  );

  const renderCurrencyTooltip = (value, name, item) => (
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
    <>
      <ChartCard
        className="col-span-1 lg:col-span-2"
        title="Daily Revenue"
        description="Smoothed daily revenue over time"
        loading={loading}
        data={dailyData}
        emptyMessage="No data for the selected range."
      >
        <TimeSeries
          data={dailyData}
          xKey="t"
          xTicks={dailyTicks}
          xTickFormatter={(value) =>
            formatDateLabel(value, { month: 'short', day: 'numeric' })
          }
          tooltipFormatter={(value) => currency(value)}
          tooltipLabelFormatter={(value) =>
            formatDateLabel(value, { month: 'short', day: 'numeric' })
          }
          tooltipProps={{
            formatter: renderCurrencyTooltip,
          }}
          series={[
            {
              key: 'y',
              label: 'Revenue',
              type: 'area',
              variant: 'primary',
              fillOpacity: 0.18,
            },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Monthly Revenue"
        description="Totals grouped by month"
        loading={loading}
        data={monthlyData}
        emptyMessage="No data for the selected range."
      >
        <BarCategory
          data={monthlyData}
          xKey="label"
          tooltipFormatter={(value) => currency(value)}
          tooltipLabelFormatter={(label) => label}
          tooltipProps={{
            formatter: renderCurrencyTooltip,
          }}
          series={[
            {
              key: 'y',
              label: 'Revenue',
              variant: 'primary',
            },
          ]}
        />
      </ChartCard>
    </>
  );
}
