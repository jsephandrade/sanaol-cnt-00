import React, { useMemo } from 'react';
import { useSalesReport } from '@/hooks/useReports';
import { formatDateLabel, formatMethodLabel } from '../common/utils';
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
    if (!data?.series?.length) return [];
    return data.series
      .map((row) => ({
        t: row.t,
        y: row.y,
        count: row.count,
      }))
      .sort((a, b) => new Date(a.t) - new Date(b.t));
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!data?.monthlyTotals?.length) return [];
    return data.monthlyTotals
      .map((row) => {
        const iso = row.t || row.month;
        const labelSource =
          typeof iso === 'string' && iso.includes('-') && iso.length === 7
            ? `${iso}-01`
            : iso;
        return {
          t: iso,
          y: row.y ?? row.total,
          label: formatDateLabel(labelSource, {
            month: 'short',
            year: 'numeric',
          }),
        };
      })
      .sort((a, b) => String(a.t).localeCompare(String(b.t)));
  }, [data]);

  const methods = useMemo(() => {
    if (!data?.byMethod?.length) return [];
    return [...data.byMethod].sort((a, b) => b.total - a.total);
  }, [data]);

  const topMethodLabel = methods.length
    ? formatMethodLabel(methods[0].label || methods[0].method)
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
