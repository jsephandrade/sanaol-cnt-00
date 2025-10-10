import React from 'react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '../common';
import { currency, RANGE_OPTIONS } from '../common/utils';

export default function SalesSummaryCards({
  summary,
  topMethodLabel,
  range,
  setRange,
  loading,
  error,
}) {
  return (
    <section className="col-span-1 space-y-4 lg:col-span-3">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">Key Metrics</h2>
            <p className="text-sm text-muted-foreground">
              Revenue and order trends sourced from live transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={option.value === range ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs font-medium"
                onClick={() => {
                  if (option.value !== range) setRange(option.value);
                }}
                disabled={loading && option.value === range}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={loading ? '--' : currency(summary.totalRevenue)}
          loading={loading}
        />
        <MetricCard
          label="Total Orders"
          value={loading ? '--' : summary.totalOrders.toLocaleString()}
          loading={loading}
        />
        <MetricCard
          label="Avg. Order Value"
          value={loading ? '--' : currency(summary.averageOrderValue)}
          loading={loading}
        />
        <MetricCard
          label="Top Payment Method"
          value={topMethodLabel}
          loading={loading && !topMethodLabel}
        />
      </div>
    </section>
  );
}
