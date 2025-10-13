import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSalesReport, useCustomerHistory } from '@/hooks/useAnalytics';
import {
  CHART_STYLES,
  CHART_COLORS,
  CHART_MARGINS,
  ANIMATION_CONFIG,
  CustomCurrencyTooltip,
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
} from '@/utils/chartConfig';

const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function OrdersPanel() {
  const { salesData, loading: salesLoading } = useSalesReport('30d');
  const { customerData, loading: customerLoading } = useCustomerHistory();

  const byDay = useMemo(() => {
    if (!customerData.length) return [];
    const map = {};
    customerData.forEach((payment) => {
      const d = new Date(payment.date).toLocaleDateString();
      if (!map[d]) {
        map[d] = { name: d, orders: 0, revenue: 0 };
      }
      map[d].orders += 1;
      map[d].revenue += payment.amount;
    });
    return Object.values(map).sort(
      (a, b) => new Date(a.name) - new Date(b.name)
    );
  }, [customerData]);

  const paymentsByMethod = useMemo(() => {
    if (!salesData?.byMethod) return [];
    return Object.entries(salesData.byMethod).map(([name, amount]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount,
    }));
  }, [salesData]);

  const loading = salesLoading || customerLoading;

  if (loading) {
    return <div className="p-6 text-center">Loading orders data...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Orders vs Revenue</CardTitle>
          <CardDescription>
            Daily orders (line) against revenue (bars)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {byDay.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No order data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={byDay}
                margin={{ left: 8, right: 24 }}
                {...ANIMATION_CONFIG.entrance}
              >
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                  opacity={CHART_STYLES.grid.opacity}
                />
                <XAxis
                  dataKey="name"
                  tick={CHART_STYLES.axisTick}
                />
                <YAxis
                  yAxisId="left"
                  tick={CHART_STYLES.axisTick}
                  width={50}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={CHART_STYLES.axisTick}
                  width={44}
                  tickFormatter={(value) => formatNumber(value, true)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div style={CHART_STYLES.tooltip.contentStyle}>
                        <p style={CHART_STYLES.tooltip.labelStyle}>{label}</p>
                        {payload.map((entry, index) => (
                          <p key={`item-${index}`} style={{ ...CHART_STYLES.tooltip.itemStyle, color: entry.color }}>
                            <span className="font-medium">{entry.name}:</span>{' '}
                            <span className="font-semibold">
                              {entry.name === 'Revenue' ? formatCurrency(entry.value) : formatNumber(entry.value)}
                            </span>
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={CHART_STYLES.legend.wrapperStyle} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill={CHART_COLORS.primary}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke={CHART_COLORS.info}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: CHART_COLORS.info }}
                  activeDot={{ r: 6, fill: CHART_COLORS.info }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Transactions by Method</CardTitle>
          <CardDescription>Distribution of payment methods</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {paymentsByMethod.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No payment data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentsByMethod}
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
                />
                <YAxis
                  tick={CHART_STYLES.axisTick}
                  width={50}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Bar
                  dataKey="amount"
                  name="Amount"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  {paymentsByMethod.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-3 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          <CardDescription>Latest processed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No recent transactions
                    </TableCell>
                  </TableRow>
                ) : (
                  customerData.slice(0, 8).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.orderId}</TableCell>
                      <TableCell>{currency(p.amount)}</TableCell>
                      <TableCell className="capitalize">{p.method}</TableCell>
                      <TableCell>
                        {new Date(p.date).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
