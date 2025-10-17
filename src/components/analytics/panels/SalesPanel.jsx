import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSalesReport } from '@/hooks/useAnalytics';
import analyticsService from '@/api/services/analyticsService';
import {
  CHART_STYLES,
  CHART_COLORS,
  CHART_GRADIENTS,
  CHART_MARGINS,
  ANIMATION_CONFIG,
  CustomCurrencyTooltip,
  formatCompactCurrency,
} from '@/utils/chartConfig';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Award,
} from 'lucide-react';

const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function SalesPanel() {
  const { salesData, loading, error } = useSalesReport('30d');

  // Get dashboard stats for key metrics
  const [dashboardStats, setDashboardStats] = React.useState(null);
  React.useEffect(() => {
    analyticsService.getDashboardStats('30d').then((res) => {
      if (res.success) {
        setDashboardStats(res.data);
      }
    });
  }, []);

  // Transform backend data for daily chart
  const daily = useMemo(() => {
    if (!dashboardStats?.recentSales) return [];
    const grouped = {};
    dashboardStats.recentSales.forEach((sale) => {
      const date = new Date(sale.date).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + sale.total;
    });
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [dashboardStats]);

  // Calculate monthly totals
  const monthly = useMemo(() => {
    if (!dashboardStats?.recentSales) return [];
    const map = {};
    dashboardStats.recentSales.forEach((sale) => {
      const d = new Date(sale.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + sale.total;
    });
    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([name, amount]) => ({ name, amount }));
  }, [dashboardStats]);

  // Calculate key metrics
  const totalRevenue = salesData?.total || 0;
  const avgOrderValue = dashboardStats?.dailySales || 0;
  const topItem = dashboardStats?.popularItems?.[0]?.name || 'N/A';

  const revenueGradient = CHART_GRADIENTS.revenue();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-6 mb-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Loading Sales Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            Fetching revenue data and statistics...
          </p>
          <div className="flex gap-2 mt-4">
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
            <div className="relative bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-full p-6 mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-destructive">
            Error Loading Sales Data
          </h3>
          <p className="text-sm text-muted-foreground">
            Unable to fetch sales analytics. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics - Individual Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card className="relative overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-card to-green-50/30 dark:from-green-950/20 dark:via-card dark:to-green-950/10 flex flex-col justify-center min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3 pt-3 px-4 relative text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-green-500/10 rounded-lg p-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider mb-2">
              Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {currency(totalRevenue)}
            </CardTitle>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                All time sales
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Monthly Sales Card */}
        <Card className="relative overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-card to-blue-50/30 dark:from-blue-950/20 dark:via-card dark:to-blue-950/10 flex flex-col justify-center min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3 pt-3 px-4 relative text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-blue-500/10 rounded-lg p-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider mb-2">
              Monthly Sales
            </CardDescription>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {currency(dashboardStats?.monthlySales || 0)}
            </CardTitle>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">
                This month
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Daily Sales Card */}
        <Card className="relative overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-card to-emerald-50/30 dark:from-emerald-950/20 dark:via-card dark:to-emerald-950/10 flex flex-col justify-center min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3 pt-3 px-4 relative text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-emerald-500/10 rounded-lg p-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider mb-2">
              Daily Sales
            </CardDescription>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              {currency(avgOrderValue)}
            </CardTitle>
            <div className="flex items-center justify-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">
                Today's total
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Top Item Card */}
        <Card className="relative overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-card to-amber-50/30 dark:from-amber-950/20 dark:via-card dark:to-amber-950/10 flex flex-col justify-center min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="pb-3 pt-3 px-4 relative text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-amber-500/10 rounded-lg p-2">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider mb-2">
              Top Selling Item
            </CardDescription>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent truncate px-2">
              {topItem}
            </CardTitle>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span className="text-xs text-amber-600 font-medium">
                Most popular
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 rounded-lg p-2">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">
                Daily Revenue
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Daily revenue trends over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 relative">
            {daily.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No sales data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={daily}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  {...ANIMATION_CONFIG.entrance}
                >
                  <defs>
                    {revenueGradient.definition}
                    <filter id="dailyShadow" height="200%">
                      <feDropShadow
                        dx="0"
                        dy="3"
                        stdDeviation="3"
                        floodOpacity="0.3"
                      />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.1}
                    stroke={CHART_STYLES.grid.stroke}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <Tooltip
                    content={<CustomCurrencyTooltip />}
                    cursor={CHART_STYLES.tooltip.cursor}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Revenue"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    fill={`url(#${revenueGradient.id})`}
                    fillOpacity={1}
                    dot={false}
                    filter="url(#dailyShadow)"
                    activeDot={{
                      ...CHART_STYLES.activeDot,
                      fill: CHART_COLORS.primary,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-blue-500/10 rounded-lg p-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base font-bold">
                Monthly Revenue
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Monthly revenue totals
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 relative">
            {monthly.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No monthly data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  {...ANIMATION_CONFIG.entrance}
                >
                  <defs>
                    <linearGradient
                      id="monthlyBarGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <filter id="monthlyShadow" height="200%">
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="2"
                        floodOpacity="0.25"
                      />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.1}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Bar
                    dataKey="amount"
                    name="Revenue"
                    radius={[8, 8, 0, 0]}
                    fill="url(#monthlyBarGrad)"
                    maxBarSize={56}
                    filter="url(#monthlyShadow)"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
