import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarCategory } from '@/features/analytics/common';
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
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-44 p-3">
        <BarCategory
          data={data}
          xKey="label"
          series={[
            {
              key: 'value',
              label: 'Revenue',
              variant: 'secondary',
            },
          ]}
          tooltipProps={{ formatter: renderTooltip }}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
