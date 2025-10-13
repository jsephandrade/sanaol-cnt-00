import React from 'react';
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

  // Merge today and yesterday sales data for comparison chart
  const salesTimeData = (stats?.salesByTime || []).map((item, index) => {
    const date = new Date(item.time);
    const hour = date.getHours();

    // Format as 12-hour time with AM/PM
    let timeLabel;
    if (hour === 0) {
      timeLabel = '12AM';
    } else if (hour < 12) {
      timeLabel = `${hour}AM`;
    } else if (hour === 12) {
      timeLabel = '12PM';
    } else {
      timeLabel = `${hour - 12}PM`;
    }

    // Get corresponding yesterday's data
    const yesterdayData = stats?.salesByTimeYesterday?.[index];

    return {
      name: timeLabel,
      today: item.amount,
      yesterday: yesterdayData?.amount || 0,
    };
  });

  // Merge today and yesterday category sales data for comparison
  const categorySalesData = React.useMemo(() => {
    const todayCategories = stats?.salesByCategory || [];
    const yesterdayCategories = stats?.salesByCategoryYesterday || [];

    // Create a map of all unique categories
    const categoryMap = new Map();

    // Add today's data
    todayCategories.forEach(item => {
      categoryMap.set(item.category, {
        name: item.category,
        today: item.amount,
        yesterday: 0
      });
    });

    // Add yesterday's data
    yesterdayCategories.forEach(item => {
      if (categoryMap.has(item.category)) {
        categoryMap.get(item.category).yesterday = item.amount;
      } else {
        categoryMap.set(item.category, {
          name: item.category,
          today: 0,
          yesterday: item.amount
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [stats?.salesByCategory, stats?.salesByCategoryYesterday]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your canteen today.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        />
        <StatsCard
          title="Orders Today"
          value={stats?.orderCount ?? (stats?.recentSales?.length || 0)}
          icon={ShoppingBag}
        />
        {isVerifier ? (
          <StatsCard
            title="Pending Accounts"
            value={verifyPagination?.total ?? (pendingRequests?.length || 0)}
            icon={ShieldCheck}
          />
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularItems items={stats?.popularItems || []} />
        <RecentSales sales={stats?.recentSales || []} />
      </div>
    </div>
  );
};

export default Dashboard;
