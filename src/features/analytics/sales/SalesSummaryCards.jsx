import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MetricCard } from '../common';
import { currency, RANGE_OPTIONS } from '../common/utils';

const RANGE_DURATIONS = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
};

export default function SalesSummaryCards({
  summary,
  topMethodLabel,
  range,
  setRange,
  loading,
  error,
}) {
  const activeRange = RANGE_OPTIONS.find((option) => option.value === range);
  const rangeLabel = activeRange?.label ?? 'Selected Range';
  const lowercaseRangeLabel = rangeLabel.toLowerCase();
  const periodDays = RANGE_DURATIONS[range] ?? RANGE_DURATIONS['30d'];
  const averageDailyRevenue = periodDays
    ? summary.totalRevenue / periodDays
    : 0;
  const averageDailyOrders = periodDays ? summary.totalOrders / periodDays : 0;

  return (
    <section className="col-span-1 space-y-6 lg:col-span-3">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/40 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-100 shadow-[0_36px_90px_-45px_rgba(15,23,42,0.85)] dark:border-slate-700/50 dark:from-indigo-500/30 dark:via-slate-950 dark:to-indigo-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)] mix-blend-screen"
        />
        <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-200/70">
              Sales Pulse
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
                {loading
                  ? 'Loading sales insights…'
                  : 'Sales performance snapshot'}
              </h2>
              <p className="max-w-md text-sm text-slate-100/80 md:max-w-lg">
                {loading
                  ? 'Fetching the latest revenue and order velocity from your POS activity.'
                  : `Visualize revenue momentum and order mix for the ${lowercaseRangeLabel}.`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {RANGE_OPTIONS.map((option) => {
              const isActive = option.value === range;
              return (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition-all duration-150 hover:bg-white/20 focus-visible:ring-white',
                    isActive &&
                      'border-white/30 bg-white text-slate-900 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)] hover:bg-white'
                  )}
                  onClick={() => {
                    if (!isActive) setRange(option.value);
                  }}
                  disabled={loading && isActive}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
        {error ? (
          <div className="relative z-10 border-t border-white/15 bg-white/10 px-6 py-3 text-xs text-rose-100">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="sky"
          label="Total Revenue"
          helper={`Gross sales • ${rangeLabel}`}
          value={loading ? '--' : currency(summary.totalRevenue)}
          loading={loading}
        >
          {!loading ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground/80 dark:text-slate-200/80">
              <span>Daily avg</span>
              <span className="font-medium">
                {currency(averageDailyRevenue)}
              </span>
            </div>
          ) : null}
        </MetricCard>

        <MetricCard
          accent="violet"
          label="Total Orders"
          helper={`Orders placed • ${rangeLabel}`}
          value={loading ? '--' : summary.totalOrders.toLocaleString()}
          loading={loading}
        >
          {!loading ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground/80 dark:text-slate-200/80">
              <span>Orders per day</span>
              <span className="font-medium">
                {averageDailyOrders.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
            </div>
          ) : null}
        </MetricCard>

        <MetricCard
          accent="emerald"
          label="Avg. Order Value"
          helper={`Average ticket • ${rangeLabel}`}
          value={loading ? '--' : currency(summary.averageOrderValue)}
          loading={loading}
        >
          {!loading ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground/80 dark:text-slate-200/80">
              <span>Orders contributing</span>
              <span className="font-medium">
                {summary.totalOrders.toLocaleString()} total
              </span>
            </div>
          ) : null}
        </MetricCard>

        <MetricCard
          accent="amber"
          label="Top Payment Method"
          helper={`Most used • ${rangeLabel}`}
          value={topMethodLabel}
          loading={loading && !topMethodLabel}
        >
          {!loading ? (
            <div className="text-xs text-muted-foreground/80 dark:text-slate-200/80">
              Encourage staff to promote{' '}
              {topMethodLabel === 'No data'
                ? 'preferred methods'
                : topMethodLabel}
              .
            </div>
          ) : null}
        </MetricCard>
      </div>
    </section>
  );
}
