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
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold">Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="aspect-[4/3] md:aspect-[16/9]">
          <SalesChart
            data={salesTimeData}
            title="Sales by Time of Day"
            description="Hourly sales distribution for today"
          />
        </div>
        <div className="aspect-[4/3] md:aspect-[16/9]">
          <CategoryChart
            data={categorySalesData}
            title="Sales by Category"
            description="Revenue distribution across menu categories"
          />
        </div>
      </div>

      {/* Popular Items & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <PopularItems items={dashboardStats.popularItems} />
        <RecentSales sales={dashboardStats.recentSales} />
      </div>
    </div>
  )
}

export default Dashboard
