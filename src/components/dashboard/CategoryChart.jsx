import React from 'react';
import { BarCategory, ChartCard } from '@/features/analytics/common';
import { currency } from '@/features/analytics/common/utils';

const CategoryChart = ({ data, title, description }) => {
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
      title={title}
      description={description}
      data={data}
      emptyMessage="No category sales logged yet."
      heightClass="h-[260px]"
      className="min-h-[320px]"
    >
      <BarCategory
        data={data}
        xKey="label"
        margin={{ top: 24, right: 18, left: 8, bottom: 16 }}
        xAxisProps={{ tickMargin: 16 }}
        yAxisProps={{
          tickFormatter: (value) => currency(value),
          width: 80,
        }}
        series={[
          {
            key: 'value',
            label: 'Revenue',
            variant: 'chart-4',
          },
        ]}
        tooltipProps={{ formatter: renderTooltip }}
      />
    </ChartCard>
  );
};

export default CategoryChart;
