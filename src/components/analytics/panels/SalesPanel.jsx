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
    return <div className="p-6 text-center">Loading sales data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">Error loading sales data</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-3 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Key Metrics</CardTitle>
          <CardDescription>
            Revenue and order trends at a glance
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-semibold">
              {currency(totalRevenue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Monthly Sales</div>
            <div className="text-2xl font-semibold">
              {currency(dashboardStats?.monthlySales || 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Daily Sales
            </div>
            <div className="text-2xl font-semibold">
              {currency(avgOrderValue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Top Item</div>
            <div className="text-2xl font-semibold">
              {topItem}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Daily Revenue</CardTitle>
          <CardDescription>Daily revenue over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {daily.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={daily}
                margin={CHART_MARGINS.default}
                {...ANIMATION_CONFIG.entrance}
              >
                <defs>
                  {revenueGradient.definition}
                </defs>
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                  opacity={CHART_STYLES.grid.opacity}
                  stroke={CHART_STYLES.grid.stroke}
                />
                <XAxis
                  dataKey="name"
                  tick={CHART_STYLES.axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={CHART_STYLES.axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={50}
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
                  strokeWidth={2}
                  fill={`url(#${revenueGradient.id})`}
                  dot={false}
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

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Revenue</CardTitle>
          <CardDescription>Totals grouped by month</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {monthly.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No monthly data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthly}
                margin={CHART_MARGINS.default}
                {...ANIMATION_CONFIG.entrance}
              >
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                  opacity={CHART_STYLES.grid.opacity}
                />
                <XAxis
                  dataKey="name"
                  tick={CHART_STYLES.axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={CHART_STYLES.axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar
                  dataKey="amount"
                  name="Revenue"
                  radius={[6, 6, 0, 0]}
                  fill={CHART_COLORS.primary}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
