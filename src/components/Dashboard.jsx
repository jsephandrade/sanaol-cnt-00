import React from "react"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"
import StatsCard from "./dashboard/StatsCard"
import SalesChart from "./dashboard/SalesChart"
import CategoryChart from "./dashboard/CategoryChart"
import PopularItems from "./dashboard/PopularItems"
import RecentSales from "./dashboard/RecentSales"
import { useDashboard } from "@/hooks/useDashboard"
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"
import ErrorState from "@/components/shared/ErrorState"

const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboard('today')

  const salesTimeData = (stats?.salesByTime || []).map(item => ({
    name: item.time,
    amount: item.amount
  }))

  const categorySalesData = (stats?.salesByCategory || []).map(item => ({
    name: item.category,
    amount: item.amount
  }))

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Today's Sales"
          value={stats?.dailySales || 0}
          change="+15% from yesterday"
          icon={DollarSign}
          formatter={(value) => `₱${value.toFixed(2)}`}
        />
        <StatsCard
          title="Monthly Sales"
          value={stats?.monthlySales || 0}
          change="+8% from last month"
          icon={TrendingUp}
          formatter={(value) => `₱${value.toFixed(2)}`}
        />
        <StatsCard
          title="Customers Today"
          value={stats?.customerCount || 0}
          change="+5% from yesterday"
          icon={Users}
        />
        <StatsCard
          title="Orders Today"
          value={stats?.orderCount ?? (stats?.recentSales?.length || 0)}
          change="+12% from yesterday"
          icon={ShoppingBag}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
  )
}

export default Dashboard
