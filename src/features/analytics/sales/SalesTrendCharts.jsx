import React, { useMemo } from 'react';
import { ChartCard, TimeSeries, BarCategory } from '../common';
import { currency, formatDateLabel, generateTicks } from '../common/utils';

export default function SalesTrendCharts({ dailyData, monthlyData, loading }) {
  const dailyTicks = useMemo(
    () => generateTicks(dailyData, 't', 6),
    [dailyData]
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'PHP',
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    []
  );

  const fullFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
      }),
    []
  );

  const axisCurrencyFormatter = (value) => {
    const number = Math.max(Number(value) || 0, 0);
    if (number < 1000) {
      return fullFormatter.format(number);
    }
    return compactFormatter.format(number);
  };

  const enhancedDailyData = useMemo(() => {
    if (!Array.isArray(dailyData) || dailyData.length === 0) {
      return [];
    }
    const windowSize = Math.min(7, dailyData.length);
    return dailyData.map((point, index) => {
      const start = Math.max(0, index - (windowSize - 1));
      const windowSlice = dailyData.slice(start, index + 1);
      const sum = windowSlice.reduce(
        (acc, entry) => acc + (Number(entry.y) || 0),
        0
      );
      const avg = windowSlice.length ? sum / windowSlice.length : 0;
      return {
        ...point,
        avg,
      };
    });
  }, [dailyData]);

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
        title="Daily Revenue Rhythm"
        description="Track daily takings alongside the 7-day moving average"
        loading={loading}
        data={enhancedDailyData}
        emptyMessage="No data for the selected range."
      >
        <TimeSeries
          data={enhancedDailyData}
          xKey="t"
          xTicks={dailyTicks}
          xTickFormatter={(value) =>
            formatDateLabel(value, { month: 'short', day: 'numeric' })
          }
          xAxisProps={{ tickMargin: 14 }}
          yAxes={[
            {
              id: 'revenue',
              orientation: 'left',
              width: 72,
              tickFormatter: axisCurrencyFormatter,
            },
          ]}
          tooltipFormatter={(value) => currency(value)}
          tooltipLabelFormatter={(value) =>
            formatDateLabel(value, {
              month: 'short',
              day: 'numeric',
              weekday: 'short',
            })
          }
          tooltipProps={{
            formatter: renderCurrencyTooltip,
            labelClassName:
              'text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground/70',
          }}
          legend
          legendProps={{
            align: 'left',
            verticalAlign: 'top',
          }}
          margin={{ top: 32, right: 28, left: 12, bottom: 16 }}
          series={[
            {
              key: 'y',
              label: 'Revenue',
              type: 'area',
              variant: 'chart-1',
              curve: 'monotone',
              strokeWidth: 2.4,
              activeDot: { r: 5 },
            },
            {
              key: 'avg',
              label: '7-day Avg',
              type: 'line',
              variant: 'chart-2',
              strokeWidth: 2.4,
              strokeOpacity: 0.85,
              dot: false,
            },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Monthly Revenue Momentum"
        description="Month-over-month performance at a glance"
        loading={loading}
        data={monthlyData}
        emptyMessage="No data for the selected range."
      >
        <BarCategory
          data={monthlyData}
          xKey="label"
          margin={{ top: 24, right: 18, left: 8, bottom: 12 }}
          xAxisProps={{ tickMargin: 16 }}
          yAxisProps={{
            width: 72,
            tickFormatter: axisCurrencyFormatter,
          }}
          tooltipFormatter={(value) => currency(value)}
          tooltipLabelFormatter={(label) => label}
          tooltipProps={{
            formatter: renderCurrencyTooltip,
          }}
          series={[
            {
              key: 'y',
              label: 'Revenue',
              variant: 'chart-4',
            },
          ]}
        />
      </ChartCard>
    </>
  );
}
