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
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCustomerHistory } from '@/hooks/useAnalytics';
import {
  CHART_STYLES,
  CHART_COLORS,
  CHART_MARGINS,
  ANIMATION_CONFIG,
  CustomCurrencyTooltip,
  formatCompactCurrency,
} from '@/utils/chartConfig';

const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function CustomersPanel() {
  const { customerData, loading, error } = useCustomerHistory();

  const byDay = useMemo(() => {
    if (!customerData.length) return [];
    const map = {};
    customerData.forEach((payment) => {
      const d = new Date(payment.date).toLocaleDateString();
      map[d] = (map[d] || 0) + payment.amount;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [customerData]);

  if (loading) {
    return <div className="p-6 text-center">Loading customer data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">Error loading customer data</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Purchases Over Time</CardTitle>
          <CardDescription>Total customer spend per day</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {byDay.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No purchase data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={byDay}
                margin={CHART_MARGINS.default}
                {...ANIMATION_CONFIG.entrance}
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{
                    r: 6,
                    fill: CHART_COLORS.primary,
                    strokeWidth: 2,
                    stroke: 'hsl(var(--background))',
                  }}
                  fill="url(#lineGrad)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Purchases</CardTitle>
          <CardDescription>Latest customer transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No recent purchases
                    </TableCell>
                  </TableRow>
                ) : (
                  customerData.slice(0, 8).map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.orderId}</TableCell>
                      <TableCell>{h.customer || '—'}</TableCell>
                      <TableCell className="capitalize">{h.method}</TableCell>
                      <TableCell className="text-right">
                        {currency(h.amount)}
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
