import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TimeSeries } from '@/features/analytics/common';
import {
  currency,
  formatDateLabel,
  generateTicks,
} from '@/features/analytics/common/utils';

const SalesChart = ({ data, title, description }) => {
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

  const renderTick = (value) =>
    formatDateLabel(value, {
      hour: 'numeric',
      minute: 'numeric',
    }) || value;

  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-44 p-3">
        <TimeSeries
          data={data}
          xKey="t"
          xTicks={ticks}
          xTickFormatter={renderTick}
          tooltipProps={{ formatter: renderTooltip }}
          series={[
            {
              key: 'y',
              label: 'Revenue',
              type: 'area',
              variant: 'primary',
              fillOpacity: 0.18,
              dot: false,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default SalesChart;
