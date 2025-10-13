import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const { stats, loading, error, refetch } = useDashboard(timeRange);
  const { hasAnyRole, token } = useAuth();
  const isVerifier = hasAnyRole(['admin', 'manager']);
  const { requests: pendingRequests, pagination: verifyPagination } =
    useVerificationQueue({
      status: 'pending',
      limit: 1,
      enabled: isVerifier && Boolean(token),
    });

  // Merge today and yesterday category sales data for comparison
  const categorySalesData = React.useMemo(() => {
    const todayCategories = stats?.salesByCategory || [];
    const yesterdayCategories = stats?.salesByCategoryYesterday || [];

    // Create a map of all unique categories
    const categoryMap = new Map();

    // Add today's/current period data
    todayCategories.forEach((item) => {
      categoryMap.set(item.category, {
        name: item.category,
        today: item.amount,
        yesterday: 0,
      });
    });

    // Only add comparison data for "today" view
    if (timeRange === 'today') {
      // Add yesterday's data
      yesterdayCategories.forEach((item) => {
        if (categoryMap.has(item.category)) {
          categoryMap.get(item.category).yesterday = item.amount;
        } else {
          categoryMap.set(item.category, {
            name: item.category,
            today: 0,
            yesterday: item.amount,
          });
        }
      });
    }

    return Array.from(categoryMap.values());
  }, [stats?.salesByCategory, stats?.salesByCategoryYesterday, timeRange]);

  // Format date range for display
  const dateRangeDisplay = React.useMemo(() => {
    if (!stats?.dateRangeStart || !stats?.dateRangeEnd) return '';

    const startDate = new Date(stats.dateRangeStart);
    const endDate = new Date(stats.dateRangeEnd);

    if (timeRange === 'today') {
      // Show full date for today
      return startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else {
      // Show date range for multi-day views
      const sameYear = startDate.getFullYear() === endDate.getFullYear();
      const sameMonth = startDate.getMonth() === endDate.getMonth() && sameYear;

      if (sameMonth) {
        // Same month: "Oct 7 - 14, 2025"
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
      } else if (sameYear) {
        // Same year: "Oct 7 - Nov 3, 2025"
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`;
      } else {
        // Different years: "Dec 25, 2024 - Jan 5, 2025"
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    }
  }, [stats?.dateRangeStart, stats?.dateRangeEnd, timeRange]);

  // Merge today and yesterday sales data for comparison chart
  const salesTimeData = React.useMemo(() => {
    return (stats?.salesByTime || []).map((item, index) => {
      const date = new Date(item.time);

      // Determine if this is hourly or daily data based on data length
      // If 24 items, it's hourly; otherwise it's daily
      const isHourlyData = (stats?.salesByTime || []).length === 24;

      let timeLabel;
      if (isHourlyData) {
        // Format as 12-hour time with AM/PM for hourly data
        const hour = date.getHours();
        if (hour === 0) {
          timeLabel = '12AM';
        } else if (hour < 12) {
          timeLabel = `${hour}AM`;
        } else if (hour === 12) {
          timeLabel = '12PM';
        } else {
          timeLabel = `${hour - 12}PM`;
        }
      } else {
        // Format as date for daily data (e.g., "Oct 7", "Oct 8")
        timeLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }

      // Only include comparison data for "today" view
      const dataPoint = {
        name: timeLabel,
        today: item.amount,
      };

      // Add comparison data only for single-day view
      if (timeRange === 'today') {
        const yesterdayData = stats?.salesByTimeYesterday?.[index];
        dataPoint.yesterday = yesterdayData?.amount || 0;
      }

      return dataPoint;
    });
  }, [stats?.salesByTime, stats?.salesByTimeYesterday, timeRange]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const timeRangeLabels = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your canteen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-md p-1">
            {Object.entries(timeRangeLabels).map(([value, label]) => (
              <Button
                key={value}
                variant={timeRange === value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(value)}
                className="h-8"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={
            timeRange === 'today'
              ? "Today's Sales"
              : `Sales (${timeRangeLabels[timeRange]})`
          }
          value={stats?.dailySales || 0}
          change={stats?.dailySalesChange}
          trend={
            stats?.dailySalesChange > 0
              ? 'up'
              : stats?.dailySalesChange < 0
                ? 'down'
                : null
          }
          comparisonPeriod="yesterday"
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
          change={stats?.monthlySalesChange}
          trend={
            stats?.monthlySalesChange > 0
              ? 'up'
              : stats?.monthlySalesChange < 0
                ? 'down'
                : null
          }
          comparisonPeriod="last month"
          icon={TrendingUp}
          formatter={(value) =>
            new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(value)
          }
        />
        <StatsCard
          title={
            timeRange === 'today'
              ? 'Orders Today'
              : `Orders (${timeRangeLabels[timeRange]})`
          }
          value={stats?.orderCount ?? (stats?.recentSales?.length || 0)}
          change={stats?.orderCountChange}
          trend={
            stats?.orderCountChange > 0
              ? 'up'
              : stats?.orderCountChange < 0
                ? 'down'
                : null
          }
          comparisonPeriod="yesterday"
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
          title={
            timeRange === 'today' ? 'Sales by Time of Day' : 'Daily Sales Trend'
          }
          description={
            timeRange === 'today'
              ? 'Hourly sales distribution for today'
              : `Daily sales for ${timeRangeLabels[timeRange].toLowerCase()}`
          }
          timeRange={timeRange}
          timeRangeLabel={timeRangeLabels[timeRange]}
        />
        <CategoryChart
          data={categorySalesData}
          title="Sales by Category"
          description={
            timeRange === 'today'
              ? 'Revenue distribution across menu categories'
              : `Revenue distribution for ${timeRangeLabels[timeRange].toLowerCase()}`
          }
          timeRange={timeRange}
          timeRangeLabel={timeRangeLabels[timeRange]}
          dateRangeDisplay={dateRangeDisplay}
        />
      </div>

      {/* Popular Items & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <PopularItems
          itemsToday={stats?.popularItems || []}
          itemsYesterday={stats?.popularItemsYesterday || []}
        />
        <RecentSales sales={stats?.recentSales || []} />
      </div>
    </div>
  );
};

export default Dashboard;
