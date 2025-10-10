import React, { useMemo } from 'react';
import { useSalesReport } from '@/hooks/useReports';
import { formatMethodLabel } from '../common/utils';
import SalesSummaryCards from './SalesSummaryCards';
import SalesTrendCharts from './SalesTrendCharts';

export default function SalesPanel() {
  const { data, loading, error, range, setRange } = useSalesReport('30d');

  const summary = {
    totalRevenue: data?.totalRevenue ?? 0,
    totalOrders: data?.totalOrders ?? 0,
    averageOrderValue: data?.averageOrderValue ?? 0,
  };

  const dailyData = useMemo(() => {
    if (!data?.dailyTotals?.length) return [];
    return data.dailyTotals
      .map((row) => ({
        name: row.date,
        amount: row.total,
      }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!data?.monthlyTotals?.length) return [];
    return data.monthlyTotals
      .map((row) => ({
        name: row.month,
        amount: row.total,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const methods = useMemo(() => {
    if (!data?.byMethod?.length) return [];
    return [...data.byMethod].sort((a, b) => b.total - a.total);
  }, [data]);

  const topMethodLabel = methods.length
    ? formatMethodLabel(methods[0].method)
    : loading
      ? 'Loading...'
      : 'No data';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <SalesSummaryCards
        summary={summary}
        topMethodLabel={topMethodLabel}
        range={range}
        setRange={setRange}
        loading={loading}
        error={error}
      />

      <SalesTrendCharts
        dailyData={dailyData}
        monthlyData={monthlyData}
        loading={loading}
      />
    </div>
  );
}
