import React, { useMemo } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, ShieldCheck } from 'lucide-react';
import StatsCard from './dashboard/StatsCard';
import SalesChart from './dashboard/SalesChart';
import CategoryChart from './dashboard/CategoryChart';
import PopularItems from './dashboard/PopularItems';
import RecentSales from './dashboard/RecentSales';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useVerificationQueue } from '@/hooks/useVerificationQueue';
import { useAuth } from '@/components/AuthContext';

const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboard('today');
  const { hasAnyRole, token } = useAuth();
  const isVerifier = hasAnyRole(['admin', 'manager']);
  const { requests: pendingRequests, pagination: verifyPagination } =
    useVerificationQueue({
      status: 'pending',
      limit: 1,
      enabled: isVerifier && Boolean(token),
    });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
      }),
    []
  );

  const salesTimeData = useMemo(
    () =>
      (stats?.salesByTime || []).map((item) => ({
        t: item.t,
        y: item.y,
        label: item.label,
      })),
    [stats?.salesByTime]
  );

  const categorySalesData = useMemo(
    () =>
      (stats?.salesByCategory || []).map((item) => ({
        label: item.label || item.category,
        value: Number(item.value ?? item.amount ?? item.total ?? item.y ?? 0),
      })),
    [stats?.salesByCategory]
  );

  const topCategory = useMemo(() => {
    if (!categorySalesData.length) return null;
    return [...categorySalesData].sort(
      (a, b) => (b.value ?? 0) - (a.value ?? 0)
    )[0];
  }, [categorySalesData]);

  const peakSalesTime = useMemo(() => {
    if (!salesTimeData.length) return null;
    const topEntry = [...salesTimeData].sort(
      (a, b) => (b.y ?? 0) - (a.y ?? 0)
    )[0];
    return topEntry?.label || topEntry?.t || null;
  }, [salesTimeData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/40 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 px-6 py-8 text-slate-100 shadow-[0_36px_90px_-45px_rgba(15,23,42,0.85)] dark:border-slate-700/50 dark:from-indigo-500/30 dark:via-slate-950 dark:to-indigo-900 md:px-10 md:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_62%)] mix-blend-screen"
        />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.35fr,1fr] md:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-200/70">
              Today&apos;s Performance
            </p>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                {currencyFormatter.format(stats?.dailySales || 0)} in revenue so
                far
              </h2>
              <p className="max-w-2xl text-sm text-slate-100/80 md:text-base">
                {topCategory
                  ? `${topCategory.label} leads category sales`
                  : 'Keep an eye on category breakdowns to stay agile during rush hours.'}
                {peakSalesTime
                  ? ` · Peak demand hits around ${peakSalesTime}.`
                  : ''}{' '}
                {pendingRequests?.length
                  ? ` · ${pendingRequests.length} account(s) await verification.`
                  : ''}
              </p>
            </div>
          </div>
          <div className="grid gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-100/70">
                Monthly Run Rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {currencyFormatter.format(stats?.monthlySales || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-100/70">
                {new Intl.DateTimeFormat('en-PH', {
                  month: 'long',
                  year: 'numeric',
                }).format(new Date())}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-100/70">
                Orders Processed
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {(
                  stats?.orderCount ??
                  stats?.recentSales?.length ??
                  0
                ).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-100/70">
                Logged via Sanaol POS today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Sales"
          value={stats?.dailySales || 0}
          icon={DollarSign}
          formatter={(value) =>
            new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(value)
          }
          helper="Across all registers"
          accent="sky"
        />
        <StatsCard
          title="Monthly Sales"
          value={stats?.monthlySales || 0}
          icon={TrendingUp}
          formatter={(value) =>
            new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(value)
          }
          helper="Projected run rate"
          accent="violet"
        />
        <StatsCard
          title="Orders Today"
          value={stats?.orderCount ?? (stats?.recentSales?.length || 0)}
          icon={ShoppingBag}
          helper="Completed from open to close"
          accent="emerald"
        />
        {isVerifier ? (
          <StatsCard
            title="Pending Accounts"
            value={verifyPagination?.total ?? (pendingRequests?.length || 0)}
            icon={ShieldCheck}
            helper="Awaiting approval"
            accent="amber"
          />
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesChart
          data={salesTimeData}
          title="Sales by Time of Day"
          description="Hourly sales distribution for today"
        />
        <CategoryChart
          data={categorySalesData}
          title="Sales by Category"
          description="Revenue distribution across menu categories"
        />
      </div>

      {/* Popular Items & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PopularItems items={stats?.popularItems || []} />
        <RecentSales sales={stats?.recentSales || []} />
      </div>
    </div>
  );
};

export default Dashboard;
