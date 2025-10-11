import React, { useMemo } from 'react';
import { ChartCard } from '@/features/analytics/common';
import { currency, formatMethodLabel } from '@/features/analytics/common/utils';

const RecentSales = ({ sales = [] }) => {
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  const formatTimestamp = (value) => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return dateFormatter.format(date);
  };

  return (
    <ChartCard
      title="Recent Sales"
      description="Latest orders closed across the floor"
      data={sales}
      emptyMessage="No recent sales logged yet."
      heightClass="min-h-[280px]"
      className="min-h-[320px]"
    >
      <div className="flex h-full flex-col gap-3">
        {sales.map((sale, index) => {
          const methodLabel = formatMethodLabel(
            sale.paymentMethod || 'walk_in'
          );
          const currencyValue = currency(sale.total);
          return (
            <div
              key={sale.id || sale.orderNumber || index.toString()}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-white/70 p-4 transition hover:border-slate-300 hover:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {sale.orderNumber || sale.id || `#${index + 1}`}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {currencyValue}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(sale.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                  {methodLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

export default RecentSales;
