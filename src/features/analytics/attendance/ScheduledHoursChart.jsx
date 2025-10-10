import React from 'react';
import { BarCategory, ChartCard } from '../common';

export default function ScheduledHoursChart({ data, loading, error }) {
  const renderTooltip = (value, name, item) => (
    <div className="flex w-full items-stretch gap-2">
      <div
        className="mt-0.5 h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: item?.payload?.fill || item?.color }}
      />
      <div className="flex flex-1 justify-between leading-none">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono font-medium text-foreground">
          {value.toLocaleString()} hrs
        </span>
      </div>
    </div>
  );

  return (
    <ChartCard
      className="lg:col-span-2"
      title="Scheduled Hours by Staff"
      description="Sum of weekly scheduled hours"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No schedule data available."
      heightClass="h-72"
    >
      <BarCategory
        data={data}
        xKey="label"
        series={[
          {
            key: 'value',
            label: 'Hours',
            variant: 'primary',
          },
        ]}
        xAxisProps={{
          interval: 0,
          angle: -15,
          textAnchor: 'end',
          height: 50,
        }}
        tooltipProps={{ formatter: renderTooltip }}
      />
    </ChartCard>
  );
}
