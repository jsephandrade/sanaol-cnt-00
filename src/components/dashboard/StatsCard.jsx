import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const StatsCard = ({ title, value, change, icon: Icon, formatter = (v) => v }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1 py-2">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl font-bold">
          {formatter(value)}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {change}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;