import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  formatter = (v) => v,
  onClick,
}) => {
  const clickable = typeof onClick === 'function';
  return (
    <Card
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={
        clickable
          ? 'cursor-pointer hover:bg-muted/50 transition-colors'
          : undefined
      }
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-1 py-2">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl font-bold">{formatter(value)}</div>
        {change ? (
          <p className="text-[11px] text-muted-foreground">{change}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
