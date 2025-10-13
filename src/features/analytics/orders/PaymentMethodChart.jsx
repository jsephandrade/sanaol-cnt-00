import React from 'react';
import { BarCategory, ChartCard } from '../common';
import { currency } from '../common/utils';

export default function PaymentMethodChart({ data, loading, error }) {
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
      title="Transactions by Method"
      description="Distribution of payment methods"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No transaction history available."
    >
      <BarCategory
        data={data}
        xKey="label"
        series={[
          {
            key: 'value',
            label: 'Revenue',
            variant: 'primary',
          },
        ]}
        tooltipProps={{
          formatter: renderTooltip,
        }}
        xAxisProps={{ interval: 0 }}
      />
    </ChartCard>
  );
}
