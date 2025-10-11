import React, { useMemo } from 'react';
import { ChartCard } from '@/features/analytics/common';

const PopularItems = ({ items = [] }) => {
  const { total, max } = useMemo(() => {
    if (!Array.isArray(items) || !items.length) {
      return { total: 0, max: 0 };
    }
    const totals = items.reduce(
      (acc, item) => {
        const count = Number(item.count || item.value || 0);
        acc.total += count;
        acc.max = Math.max(acc.max, count);
        return acc;
      },
      { total: 0, max: 0 }
    );
    return totals;
  }, [items]);

  return (
    <ChartCard
      title="Popular Items"
      description="Top-performing menu items based on order volume"
      data={items}
      emptyMessage="No popular items recorded yet."
      heightClass="min-h-[280px]"
      className="min-h-[320px]"
    >
      <div className="flex h-full flex-col gap-4">
        {items.map((item, index) => {
          const count = Number(item.count || item.value || 0);
          const progress = max ? Math.round((count / max) * 100) : 0;
          const share = total ? Math.round((count / total) * 100) : 0;
          return (
            <div
              key={`${item.name || 'item'}-${index.toString()}`}
              className="group rounded-xl border border-slate-200/60 bg-white/70 p-4 transition hover:border-slate-300 hover:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {share}% of orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {count.toLocaleString()} orders
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

export default PopularItems;
