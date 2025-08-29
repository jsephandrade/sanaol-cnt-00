import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { dashboardStats, salesData } from "@/utils/mockData"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"

const TICK_STYLE = {
  fontSize: 10,
  fill: "hsl(var(--muted-foreground))"
}

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

      {/* Stats Cards Row (unchanged size; already compact) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 py-2">
            <CardTitle className="text-xs font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">
              ₱{dashboardStats.dailySales.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              +15% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 py-2">
            <CardTitle className="text-xs font-medium">Monthly Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">
              ₱{dashboardStats.monthlySales.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 py-2">
            <CardTitle className="text-xs font-medium">
              Customers Today
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">
              {dashboardStats.customerCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              +5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 py-2">
            <CardTitle className="text-xs font-medium">Orders Today</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{salesData.length}</div>
            <p className="text-[11px] text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row — compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Sales by Time of Day</CardTitle>
            <CardDescription className="text-xs">
              Hourly sales distribution for today
            </CardDescription>
          </CardHeader>
          <CardContent className="h-44 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesTimeData}
                margin={{ top: 4, right: 8, left: 16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.08}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={TICK_STYLE}
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={TICK_STYLE}
                  width={44}
                  axisLine={false}
                  tickLine={false}
                  tickCount={4}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <Tooltip
                  wrapperStyle={{ fontSize: 11 }}
                  labelStyle={{ fontSize: 11 }}
                  contentStyle={{ padding: "6px 8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="url(#colorPrimary)"
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Sales by Category</CardTitle>
            <CardDescription className="text-xs">
              Revenue distribution across menu categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-44 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categorySalesData}
                margin={{ top: 4, right: 8, left: 16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={TICK_STYLE}
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={TICK_STYLE}
                  width={44}
                  axisLine={false}
                  tickLine={false}
                  tickCount={4}
                />
                <Tooltip
                  wrapperStyle={{ fontSize: 11 }}
                  labelStyle={{ fontSize: 11 }}
                  contentStyle={{ padding: "6px 8px" }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--secondary))"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Popular Items</CardTitle>
            <CardDescription className="text-xs">
              Most ordered items in the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {dashboardStats.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-sm">{index + 1}.</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {item.count} orders
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm">Recent Sales</CardTitle>
            <CardDescription className="text-xs">
              Latest orders processed in the canteen
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {dashboardStats.recentSales.map(sale => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">Order #{sale.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ₱{sale.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {sale.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
