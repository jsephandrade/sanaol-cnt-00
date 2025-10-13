import React, { useMemo } from 'react';
import { ChartCard, Donut } from '../common';
import { formatPercent } from '../common/utils';

export default function InventoryLowStockChart({ data, loading, error }) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + Number(item.value || 0), 0),
    [data]
  );

  const renderTooltip = (value, name, item) => {
    const count = Number(value || 0);
    const percent = total ? formatPercent(count, total, 0) : null;
    return (
      <div className="flex w-full items-center justify-between leading-none">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono font-medium text-foreground">
          {count.toLocaleString()}
          {percent ? ` · ${percent}` : ''}
        </span>
      </div>
    );
  };

  return (
    <ChartCard
      title="Low Stock Ratio"
      description="Items at or below minimum"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No inventory records available."
    >
      <Donut
        data={data}
        legend
        innerRadius={52}
        outerRadius={76}
        tooltipProps={{
          formatter: renderTooltip,
        }}
      />
    </ChartCard>
  );
}
