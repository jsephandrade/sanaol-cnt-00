import React, { useMemo } from 'react';
import { useCustomerHistory } from '@/hooks/useReports';
import CustomerHistoryChart from './CustomerHistoryChart';
import RecentPurchasesTable from './RecentPurchasesTable';

export default function CustomersPanel() {
  const { data: history = [], loading, error } = useCustomerHistory();

  const dailyTotals = useMemo(() => {
    if (!history.length) return [];
    const totals = new Map();

    history.forEach((entry) => {
      if (!entry?.date) return;
      const date = new Date(entry.date);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`;
      const label = date.toLocaleDateString();
      const current = totals.get(key) || { key, name: label, total: 0 };
      current.total += Number(entry.amount ?? 0);
      totals.set(key, current);
    });

    const ordered = Array.from(totals.values()).sort((a, b) =>
      a.key > b.key ? 1 : -1
    );

    return ordered.map(({ key: _key, ...rest }) => rest);
  }, [history]);

  const recentPurchases = useMemo(() => {
    if (!history.length) return [];
    return [...history]
      .filter(
        (entry) => entry?.date && !Number.isNaN(new Date(entry.date).getTime())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [history]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <CustomerHistoryChart
        data={dailyTotals}
        loading={loading}
        error={error}
      />

      <RecentPurchasesTable
        purchases={recentPurchases}
        loading={loading}
        error={error}
      />
    </div>
  );
}
