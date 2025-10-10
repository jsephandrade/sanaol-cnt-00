import React from 'react';
import { BarCategory, ChartCard } from '../common';
import { formatNumber } from '../common/utils';

export default function InventoryStockLevelsChart({ data, loading, error }) {
  const renderTooltip = (value, name, item) => {
    const unit = item?.payload?.unit ? ` ${item.payload.unit}` : '';
    return (
      <div className="flex w-full items-stretch gap-2">
        <div
          className="mt-0.5 h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: item?.payload?.fill || item?.color }}
        />
        <div className="flex flex-1 justify-between leading-none">
          <span className="text-muted-foreground">{name}</span>
          <span className="font-mono font-medium text-foreground">
            {formatNumber(value)}
            {unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <ChartCard
      className="col-span-1 lg:col-span-2"
      title="Stock Levels by Item"
      description="Monitor current on-hand quantities"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No inventory records available."
    >
      <BarCategory
        data={data}
        xKey="label"
        series={[
          {
            key: 'value',
            label: 'Quantity',
            variant: 'primary',
          },
        ]}
        xAxisProps={{
          interval: 0,
          angle: -20,
          textAnchor: 'end',
          height: 60,
        }}
        tooltipProps={{
          formatter: renderTooltip,
        }}
      />
    </ChartCard>
  );
}
