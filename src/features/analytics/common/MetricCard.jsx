import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const TREND_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
};

export default function MetricCard({
  label,
  value,
  loading = false,
  helper = null,
  trend = null,
  trendDirection = 'up',
  icon: Icon,
  actions = null,
  children = null,
  className = '',
  onClick,
  disabled = false,
}) {
  const TrendIcon =
    trendDirection === 'down' ? TREND_ICONS.down : TREND_ICONS.up;
  const trendColor =
    trendDirection === 'down' ? 'text-destructive' : 'text-emerald-500';
  const clickable = typeof onClick === 'function' && !disabled;

  return (
    <Card
      className={cn(
        'h-full',
        clickable && 'cursor-pointer transition-colors hover:bg-muted/40',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </CardTitle>
            {helper ? (
              <p className="mt-1 text-xs text-muted-foreground/80">{helper}</p>
            ) : null}
          </div>
          {Icon || actions ? (
            <div className="flex items-center gap-2">
              {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
              {actions}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        )}
        {trend ? (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trendColor
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            <span>{trend}</span>
          </div>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
