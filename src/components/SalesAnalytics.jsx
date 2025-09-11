import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data sources
import {
  mockInventoryItems,
  mockPayments,
  mockSalesAnalytics,
  mockOrders,
} from '@/api/mockData';
import { salesData, employees, scheduleData } from '@/utils/mockData';

// Helpers
import { groupSalesByDate, getSalesByPaymentMethod } from '@/utils/salesUtils';

const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// ----- Sales (Daily & Monthly)
function SalesPanel() {
  const daily = useMemo(() => {
    const grouped = groupSalesByDate(salesData).map((d) => ({
      name: d.date,
      amount: d.total,
    }));
    return grouped.sort((a, b) => new Date(a.name) - new Date(b.name));
  }, []);

  const monthly = useMemo(() => {
    const map = {};
    for (const s of salesData) {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + s.total;
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([name, amount]) => ({ name, amount }));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Key Metrics</CardTitle>
          <CardDescription>
            Revenue and order trends at a glance
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-semibold">
              {currency(mockSalesAnalytics.totalRevenue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-semibold">
              {mockSalesAnalytics.totalOrders.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Avg. Order Value
            </div>
            <div className="text-2xl font-semibold">
              {currency(mockSalesAnalytics.averageOrderValue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Top Item</div>
            <div className="text-2xl font-semibold">
              {mockSalesAnalytics.topSellingItems[0]?.name}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Revenue</CardTitle>
          <CardDescription>Smoothed daily revenue over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={daily}
              margin={{ top: 6, left: 8, right: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.06}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip formatter={(v) => currency(v)} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill="url(#gradRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monthly Revenue</CardTitle>
          <CardDescription>Totals grouped by month</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Inventory Reports
function InventoryPanel() {
  const qtyByItem = useMemo(
    () => mockInventoryItems.map((i) => ({ name: i.name, qty: i.quantity })),
    []
  );
  const lowStock = useMemo(
    () => mockInventoryItems.filter((i) => i.quantity <= i.minStock).length,
    []
  );
  const okStock = mockInventoryItems.length - lowStock;
  const soonToExpire = useMemo(() => {
    const now = new Date();
    const thresholdDays = 7;
    return mockInventoryItems
      .map((i) => ({
        ...i,
        daysToExpiry: i.expiryDate
          ? Math.ceil((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24))
          : null,
      }))
      .filter((i) => i.daysToExpiry !== null && i.daysToExpiry <= thresholdDays)
      .sort((a, b) => (a.daysToExpiry ?? 9999) - (b.daysToExpiry ?? 9999));
  }, []);

  const pieData = [
    { name: 'Low', value: lowStock, color: 'hsl(var(--destructive))' },
    { name: 'OK', value: okStock, color: 'hsl(var(--primary))' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Stock Levels by Item</CardTitle>
          <CardDescription>Monitor current on-hand quantities</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qtyByItem} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} width={42} />
              <Tooltip />
              <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                {qtyByItem.map((_, idx) => (
                  <Cell key={idx} fill="hsl(var(--primary))" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Low Stock Ratio</CardTitle>
          <CardDescription>Items at or below minimum</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={48}
                outerRadius={64}
                paddingAngle={2}
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Expiring Soon (≤ 7 days)</CardTitle>
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
                      <TableCell>{i.daysToExpiry}</TableCell>
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

// ----- Orders & Transactions
function OrdersPanel() {
  const byDay = useMemo(() => {
    const map = {};
    for (const s of salesData) {
      const d = new Date(s.date).toLocaleDateString();
      map[d] = map[d] || { name: d, orders: 0, revenue: 0 };
      map[d].orders += 1;
      map[d].revenue += s.total;
    }
    return Object.values(map).sort(
      (a, b) => new Date(a.name) - new Date(b.name)
    );
  }, []);

  const paymentsByMethod = useMemo(
    () =>
      getSalesByPaymentMethod(salesData).map((x) => ({
        ...x,
        amount: x.value,
      })),
    []
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Orders vs Revenue</CardTitle>
          <CardDescription>
            Daily orders (line) against revenue (bars)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={byDay} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={44} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                width={44}
              />
              <Tooltip
                formatter={(v, n) => (n === 'revenue' ? currency(v) : v)}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="hsl(var(--foreground))"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transactions by Method</CardTitle>
          <CardDescription>Distribution of payment methods</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentsByMethod}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Transactions</CardTitle>
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
                {[...mockPayments]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 8)
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.orderId}</TableCell>
                      <TableCell>{currency(p.amount)}</TableCell>
                      <TableCell className="capitalize">{p.method}</TableCell>
                      <TableCell>
                        {new Date(p.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Staff Attendance Reports
function AttendancePanel() {
  // Aggregate scheduled hours per employee (simple calc from HH:MM)
  const toHours = (start, end) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh + em / 60 - (sh + sm / 60);
  };
  const hours = useMemo(() => {
    const map = {};
    for (const s of scheduleData) {
      const h = toHours(s.startTime, s.endTime);
      map[s.employeeName] = (map[s.employeeName] || 0) + h;
    }
    return Object.entries(map).map(([name, hrs]) => ({
      name,
      hours: Math.round(hrs * 10) / 10,
    }));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Scheduled Hours by Staff</CardTitle>
          <CardDescription>Sum of weekly scheduled hours</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hours}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v) => `${v} hrs`} />
              <Bar
                dataKey="hours"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Staff Roster</CardTitle>
          <CardDescription>Key roles and hourly rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Hourly Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.slice(0, 6).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.position}</TableCell>
                    <TableCell className="text-right">
                      {currency(e.hourlyRate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Customer Purchase History
function CustomersPanel() {
  const history = useMemo(() => {
    // Derive a simple history from payments + orders
    const orderMap = Object.fromEntries(
      (mockOrders || []).map((o) => [o.orderNumber || o.id, o])
    );
    return [...mockPayments]
      .map((p) => ({
        id: p.id,
        order: p.orderId,
        amount: p.amount,
        method: p.method,
        when: p.timestamp,
        customer: orderMap[p.orderId]?.customerName || '—',
      }))
      .sort((a, b) => new Date(b.when) - new Date(a.when));
  }, []);

  const byDay = useMemo(() => {
    const map = {};
    for (const h of history) {
      const d = new Date(h.when).toLocaleDateString();
      map[d] = (map[d] || 0) + h.amount;
    }
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [history]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Purchases Over Time</CardTitle>
          <CardDescription>Total customer spend per day</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v) => currency(v)} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Purchases</CardTitle>
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
                {history.slice(0, 8).map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.order}</TableCell>
                    <TableCell>{h.customer}</TableCell>
                    <TableCell className="capitalize">{h.method}</TableCell>
                    <TableCell className="text-right">
                      {currency(h.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SalesAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Analytics</h2>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="orders">Orders & Transactions</TabsTrigger>
          <TabsTrigger value="attendance">Staff Attendance</TabsTrigger>
          <TabsTrigger value="customers">Customer Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <SalesPanel />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryPanel />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersPanel />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendancePanel />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
