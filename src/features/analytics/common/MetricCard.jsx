import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

const TREND_ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

const ACCENT_THEMES = {
  neutral: {
    frame:
      'border-transparent bg-gradient-to-br from-muted/40 via-background to-background shadow-[0_22px_45px_-30px_rgba(15,23,42,0.55)]',
    halo: 'bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_60%)]',
    icon: 'bg-muted/60 text-muted-foreground',
    text: 'text-foreground',
    helper: 'text-muted-foreground/80',
  },
  sky: {
    frame:
      'border-sky-500/10 bg-gradient-to-br from-sky-500/18 via-sky-400/10 to-transparent shadow-[0_26px_60px_-32px_rgba(14,165,233,0.65)]',
    halo: 'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.38),_transparent_58%)]',
    icon: 'bg-sky-500/15 text-sky-600',
    text: 'text-sky-900 dark:text-sky-200',
    helper: 'text-sky-900/70 dark:text-sky-200/70',
  },
  violet: {
    frame:
      'border-violet-500/10 bg-gradient-to-br from-violet-500/18 via-violet-400/12 to-transparent shadow-[0_26px_60px_-32px_rgba(139,92,246,0.6)]',
    halo: 'bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.38),_transparent_58%)]',
    icon: 'bg-violet-500/15 text-violet-600',
    text: 'text-violet-900 dark:text-violet-200',
    helper: 'text-violet-900/70 dark:text-violet-200/70',
  },
  emerald: {
    frame:
      'border-emerald-500/10 bg-gradient-to-br from-emerald-500/18 via-emerald-400/12 to-transparent shadow-[0_26px_60px_-32px_rgba(16,185,129,0.55)]',
    halo: 'bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.35),_transparent_58%)]',
    icon: 'bg-emerald-500/15 text-emerald-600',
    text: 'text-emerald-900 dark:text-emerald-200',
    helper: 'text-emerald-900/70 dark:text-emerald-200/70',
  },
  amber: {
    frame:
      'border-amber-500/10 bg-gradient-to-br from-amber-400/22 via-amber-300/15 to-transparent shadow-[0_26px_60px_-32px_rgba(251,191,36,0.55)]',
    halo: 'bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.4),_transparent_58%)]',
    icon: 'bg-amber-400/20 text-amber-600',
    text: 'text-amber-900 dark:text-amber-100',
    helper: 'text-amber-900/70 dark:text-amber-100/70',
  },
  rose: {
    frame:
      'border-rose-500/10 bg-gradient-to-br from-rose-500/18 via-rose-400/12 to-transparent shadow-[0_26px_60px_-32px_rgba(244,63,94,0.58)]',
    halo: 'bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.35),_transparent_58%)]',
    icon: 'bg-rose-500/15 text-rose-600',
    text: 'text-rose-900 dark:text-rose-200',
    helper: 'text-rose-900/70 dark:text-rose-200/70',
  },
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
  accent = 'neutral',
}) {
  const theme = ACCENT_THEMES[accent] || ACCENT_THEMES.neutral;
  const direction =
    trendDirection === 'down'
      ? 'down'
      : trendDirection === 'flat'
        ? 'flat'
        : 'up';
  const TrendIcon = TREND_ICONS[direction];
  const trendColor =
    direction === 'down'
      ? 'text-rose-600 dark:text-rose-300'
      : direction === 'flat'
        ? 'text-muted-foreground'
        : 'text-emerald-600 dark:text-emerald-300';
  const clickable = typeof onClick === 'function' && !disabled;

  return (
    <Card
      className={cn(
        'relative h-full overflow-hidden rounded-2xl border bg-card/90 backdrop-blur-sm transition-all duration-200 ease-out',
        theme.frame,
        clickable && 'cursor-pointer hover:-translate-y-1 hover:shadow-lg',
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
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 opacity-85',
          theme.halo
        )}
      />
      <div className="relative z-10 flex h-full flex-col">
        <CardHeader className="flex flex-col gap-4 p-5 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80',
                  theme.text
                )}
              >
                {label}
              </CardTitle>
              {helper ? (
                <p className={cn('text-xs', theme.helper)}>{helper}</p>
              ) : null}
            </div>
            {Icon || actions ? (
              <div className="flex items-center gap-2">
                {Icon ? (
                  <span
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-white/20',
                      theme.icon
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
                {actions}
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5 pt-4">
          {loading ? (
            <Skeleton className="h-9 w-32 rounded-lg" />
          ) : (
            <div
              className={cn(
                'text-3xl font-semibold tracking-tight drop-shadow-sm',
                theme.text
              )}
            >
              {value}
            </div>
          )}

          {trend ? (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trendColor
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{trend}</span>
            </div>
          ) : null}

          {children}
        </CardContent>
      </div>
    </Card>
  );
}
