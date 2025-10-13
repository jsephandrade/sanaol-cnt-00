import React, { useMemo } from 'react';
import { useCustomerHistory, useOrdersReport } from '@/hooks/useReports';
import { formatMethodLabel } from '../common/utils';
import OrderStatusOverview from './OrderStatusOverview';
import OrdersRevenueChart from './OrdersRevenueChart';
import PaymentMethodChart from './PaymentMethodChart';
import RecentTransactionsTable from './RecentTransactionsTable';

export default function OrdersPanel() {
  const {
    data: history = [],
    loading: historyLoading,
    error: historyError,
  } = useCustomerHistory();

  const {
    data: ordersSummary,
    loading: ordersLoading,
    error: ordersError,
  } = useOrdersReport();

  const byDay = useMemo(() => {
    if (!history.length) return [];
    const map = new Map();

    history.forEach((entry) => {
      if (!entry?.date) return;
      const date = new Date(entry.date);
      if (Number.isNaN(date.getTime())) return;

      const key = date.toISOString().slice(0, 10);
      let bucket = map.get(key);

      if (!bucket) {
        bucket = {
          key,
          t: key,
          revenue: 0,
          orders: 0,
          orderIds: new Set(),
        };
        map.set(key, bucket);
      }

      bucket.revenue += Number(entry.amount ?? 0);
      if (entry.orderId) {
        if (!bucket.orderIds.has(entry.orderId)) {
          bucket.orderIds.add(entry.orderId);
          bucket.orders += 1;
        }
      } else {
        bucket.orders += 1;
      }
    });

    const ordered = Array.from(map.values()).sort((a, b) =>
      a.key > b.key ? 1 : -1
    );

    return ordered.map(({ key: _key, orderIds: _orderIds, ...rest }) => rest);
  }, [history]);

  const paymentsByMethod = useMemo(() => {
    if (!history.length) return [];
    const totals = new Map();

    history.forEach((entry) => {
      const method = (entry.method || 'unknown').toLowerCase();
      const current = totals.get(method) ?? 0;
      totals.set(method, current + Number(entry.amount ?? 0));
    });

    return Array.from(totals.entries())
      .map(([method, amount]) => ({
        label: formatMethodLabel(method),
        value: amount,
      }))
      .sort((a, b) => b.value - a.value);
  }, [history]);

  const recentTransactions = useMemo(() => {
    if (!history.length) return [];
    return [...history]
      .filter(
        (entry) => entry?.date && !Number.isNaN(new Date(entry.date).getTime())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [history]);

  const statusEntries = ordersSummary?.byStatus ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <OrderStatusOverview
        entries={statusEntries}
        loading={ordersLoading}
        error={ordersError}
      />

      <OrdersRevenueChart
        data={byDay}
        loading={historyLoading}
        error={historyError}
      />

      <PaymentMethodChart
        data={paymentsByMethod}
        loading={historyLoading}
        error={historyError}
      />

      <RecentTransactionsTable
        transactions={recentTransactions}
        loading={historyLoading}
        error={historyError}
      />
    </div>
  );
}
