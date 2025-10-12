import React from 'react';
import { ChartCard, Donut } from '../common';
import { currency } from '../common/utils';

const SalesCategoryChart = ({ data = [], loading, error }) => {
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
      title="Sales by Category"
      description="Share of revenue by menu category"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No category sales logged for this range."
      heightClass="h-[260px]"
      className="lg:col-span-1"
    >
      <Donut
        data={data}
        nameKey="label"
        valueKey="value"
        tooltipFormatter={(value) => currency(value)}
        tooltipLabelFormatter={(label) => label}
        tooltipProps={{ formatter: renderTooltip }}
        legendProps={{
          verticalAlign: 'bottom',
          align: 'center',
        }}
        className="max-h-[220px]"
      />
    </ChartCard>
  );
};

export default SalesCategoryChart;
