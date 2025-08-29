import React from "react"
import { dashboardStats, salesData } from "@/utils/mockData"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"
import StatsCard from "./dashboard/StatsCard"
import SalesChart from "./dashboard/SalesChart"
import CategoryChart from "./dashboard/CategoryChart"
import PopularItems from "./dashboard/PopularItems"
import RecentSales from "./dashboard/RecentSales"

const Dashboard = () => {
  const salesTimeData = dashboardStats.salesByTime.map(item => ({
    name: item.time,
    amount: item.amount
  }))

  const categorySalesData = dashboardStats.salesByCategory.map(item => ({
    name: item.category,
    amount: item.amount
  }))

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Today's Sales"
          value={dashboardStats.dailySales}
          change="+15% from yesterday"
          icon={DollarSign}
          formatter={(value) => `₱${value.toFixed(2)}`}
        />
        <StatsCard
          title="Monthly Sales"
          value={dashboardStats.monthlySales}
          change="+8% from last month"
          icon={TrendingUp}
          formatter={(value) => `₱${value.toFixed(2)}`}
        />
        <StatsCard
          title="Customers Today"
          value={dashboardStats.customerCount}
          change="+5% from yesterday"
          icon={Users}
        />
        <StatsCard
          title="Orders Today"
          value={salesData.length}
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
        <PopularItems items={dashboardStats.popularItems} />
        <RecentSales sales={dashboardStats.recentSales} />
      </div>
    </div>
  )
}

export default Dashboard
