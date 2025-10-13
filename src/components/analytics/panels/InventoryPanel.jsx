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
  Legend,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useInventoryReport } from '@/hooks/useAnalytics';
import {
  CHART_STYLES,
  CHART_COLORS,
  CHART_MARGINS,
  ANIMATION_CONFIG,
  CustomNumericTooltip,
  formatNumber,
  formatPercent,
} from '@/utils/chartConfig';

export default function InventoryPanel() {
  const { inventoryData, loading, error } = useInventoryReport();

  const qtyByItem = useMemo(
    () => inventoryData.map((i) => ({ name: i.name, qty: i.quantity })),
    [inventoryData]
  );

  const lowStock = useMemo(
    () => inventoryData.filter((i) => i.quantity <= i.minStock).length,
    [inventoryData]
  );

  const okStock = inventoryData.length - lowStock;

  const soonToExpire = useMemo(() => {
    const now = new Date();
    const thresholdDays = 7;
    return inventoryData
      .filter((i) => i.expiryDate)
      .map((i) => ({
        ...i,
        daysToExpiry: Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24)),
      }))
      .filter((i) => i.daysToExpiry <= thresholdDays)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [inventoryData]);

  const pieData = [
    { name: 'Low', value: lowStock, color: CHART_COLORS.danger },
    { name: 'OK', value: okStock, color: CHART_COLORS.success },
  ];

  const totalItems = lowStock + okStock;

  if (loading) {
    return <div className="p-6 text-center">Loading inventory data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">Error loading inventory data</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Stock Levels by Item</CardTitle>
          <CardDescription>Monitor current on-hand quantities</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={qtyByItem}
              margin={{ left: 8, right: 8, top: 8, bottom: 40 }}
              {...ANIMATION_CONFIG.entrance}
            >
              <CartesianGrid
                strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                opacity={CHART_STYLES.grid.opacity}
              />
              <XAxis
                dataKey="name"
                tick={CHART_STYLES.axisTick}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={CHART_STYLES.axisTick}
                width={42}
                tickFormatter={(value) => formatNumber(value, true)}
              />
              <Tooltip
                content={<CustomNumericTooltip valueFormatter={(v) => `${formatNumber(v)} units`} />}
              />
              <Bar
                dataKey="qty"
                name="Quantity"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {qtyByItem.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={CHART_COLORS.palette[idx % CHART_COLORS.palette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Low Stock Ratio</CardTitle>
          <CardDescription>Items at or below minimum</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={<CustomNumericTooltip valueFormatter={(v) => `${v} items`} />}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={4}
                {...ANIMATION_CONFIG.entrance}
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="outside"
                  formatter={(value) => formatPercent((value / totalItems) * 100, 0)}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: 'hsl(var(--foreground))',
                  }}
                />
              </Pie>
              <Legend
                wrapperStyle={CHART_STYLES.legend.wrapperStyle}
                iconSize={CHART_STYLES.legend.iconSize}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-3 transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Expiring Soon (≤ 7 days)</CardTitle>
          <CardDescription>Prioritize usage or restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Days left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soonToExpire.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No items expiring soon
                    </TableCell>
                  </TableRow>
                ) : (
                  soonToExpire.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell>
                        {i.quantity} {i.unit}
                      </TableCell>
                      <TableCell>
                        {new Date(i.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className={i.daysToExpiry <= 2 ? 'font-semibold text-destructive' : ''}
                      >
                        {i.daysToExpiry}
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
