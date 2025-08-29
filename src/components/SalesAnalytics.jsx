import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { salesData, menuItems } from '@/utils/mockData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to group sales by date
const groupSalesByDate = (data) => {
  const grouped = data.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {});
  return Object.entries(grouped).map(([date, total]) => ({
    date,
    total,
  }));
};

// Helper function to get sales by payment method
const getSalesByPaymentMethod = (data) => {
  const grouped = data.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
  }, {});
  return Object.entries(grouped).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
};

// Helper function to get sales by item
const getSalesByItem = (data) => {
  const itemSales = {};
  data.forEach((sale) => {
    sale.items.forEach((item) => {
      const itemName = item.menuItemName;
      itemSales[itemName] =
        (itemSales[itemName] || 0) + item.price * item.quantity;
    });
  });
  return Object.entries(itemSales)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
};

// Helper function to get top selling items
const getTopSellingItems = (data) => {
  return getSalesByItem(data).slice(0, 5);
};

// Helper function to get lowest selling items
const getLowestSellingItems = (data) => {
  const allItems = getSalesByItem(data);
  return allItems.slice(-5).reverse(); // Get last 5 and reverse to show lowest first
};
const dailySalesData = groupSalesByDate(salesData);
const paymentMethodData = getSalesByPaymentMethod(salesData);
const topSellingItemsData = getTopSellingItems(salesData);
const lowestSellingItemsData = getLowestSellingItems(salesData);

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Historical analytics data
const peakHoursData = [
  {
    hour: '8:00',
    sales: 45,
    orders: 8,
  },
  {
    hour: '9:00',
    sales: 78,
    orders: 12,
  },
  {
    hour: '10:00',
    sales: 120,
    orders: 18,
  },
  {
    hour: '11:00',
    sales: 185,
    orders: 25,
  },
  {
    hour: '12:00',
    sales: 280,
    orders: 35,
  },
  {
    hour: '13:00',
    sales: 320,
    orders: 42,
  },
  {
    hour: '14:00',
    sales: 195,
    orders: 28,
  },
  {
    hour: '15:00',
    sales: 165,
    orders: 22,
  },
  {
    hour: '16:00',
    sales: 140,
    orders: 19,
  },
  {
    hour: '17:00',
    sales: 110,
    orders: 15,
  },
];
const monthlyComparison = [
  {
    month: 'Jan',
    sales: 12500,
    orders: 450,
  },
  {
    month: 'Feb',
    sales: 13200,
    orders: 480,
  },
  {
    month: 'Mar',
    sales: 14800,
    orders: 520,
  },
  {
    month: 'Apr',
    sales: 16200,
    orders: 580,
  },
  {
    month: 'May',
    sales: 15900,
    orders: 565,
  },
  {
    month: 'Jun',
    sales: 17300,
    orders: 620,
  },
];

const mockPayments = [
  {
    id: '1',
    orderId: 'ORD-2581',
    amount: 45.75,
    date: '2025-04-17 10:32:15',
    method: 'card',
    status: 'completed',
    customer: 'John Doe',
  },
  {
    id: '2',
    orderId: 'ORD-2582',
    amount: 22.5,
    date: '2025-04-17 11:15:22',
    method: 'cash',
    status: 'completed',
  },
  {
    id: '3',
    orderId: 'ORD-2583',
    amount: 38.9,
    date: '2025-04-17 12:25:40',
    method: 'mobile',
    status: 'completed',
    customer: 'Sarah Johnson',
  },
  {
    id: '4',
    orderId: 'ORD-2584',
    amount: 29.95,
    date: '2025-04-17 13:10:05',
    method: 'card',
    status: 'failed',
    customer: 'Alex Chen',
  },
  {
    id: '5',
    orderId: 'ORD-2585',
    amount: 52.35,
    date: '2025-04-17 14:27:51',
    method: 'mobile',
    status: 'completed',
    customer: 'Maria Lopez',
  },
  {
    id: '6',
    orderId: 'ORD-2586',
    amount: 18.25,
    date: '2025-04-17 15:45:12',
    method: 'cash',
    status: 'completed',
  },
  {
    id: '7',
    orderId: 'ORD-2587',
    amount: 65.8,
    date: '2025-04-17 16:30:45',
    method: 'card',
    status: 'refunded',
    customer: 'David Brown',
  },
];
const SalesAnalytics = () => {
  const [dateRange, setDateRange] = useState('week');
  const [payments, setPayments] = useState(mockPayments);

  const getTotalAmount = (status = 'all') => {
    return payments
      .filter((payment) => status === 'all' || payment.status === status)
      .reduce((total, payment) => {
        if (payment.status === 'refunded') return total;
        return total + payment.amount;
      }, 0)
      .toFixed(2);
  };

  const generateFinancialReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.text('Financial Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    // Financial Summary
    doc.setFontSize(16);
    doc.text('Financial Summary', 20, 50);

    const totalSales = salesData.reduce((acc, sale) => acc + sale.total, 0);
    const totalOrders = salesData.length;
    const avgOrderValue = totalSales / totalOrders;

    doc.setFontSize(12);
    doc.text(`Total Sales: ₱${totalSales.toFixed(2)}`, 20, 65);
    doc.text(`Total Orders: ${totalOrders}`, 20, 75);
    doc.text(`Average Order Value: ₱${avgOrderValue.toFixed(2)}`, 20, 85);
    doc.text(`Monthly Growth: +23%`, 20, 95);

    // Daily Sales Table
    doc.text('Daily Sales Breakdown', 20, 115);
    const dailySalesTable = dailySalesData.map((item) => [
      item.date,
      `₱${item.total.toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Date', 'Sales Amount']],
      body: dailySalesTable,
    });

    doc.save('financial-analytics-report.pdf');
  };

  const generateMenuReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.text('Menu Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    // Menu Performance Summary
    doc.setFontSize(16);
    doc.text('Menu Performance Summary', 20, 50);

    doc.setFontSize(12);
    doc.text(`Best Performer: ${topSellingItemsData[0]?.name}`, 20, 65);
    doc.text(`Revenue: ₱${topSellingItemsData[0]?.value.toFixed(2)}`, 20, 75);
    doc.text(`Needs Attention: ${lowestSellingItemsData[0]?.name}`, 20, 85);
    doc.text(`Total Menu Items: ${menuItems.length}`, 20, 95);

    // Top Selling Items Table
    doc.text('Top Selling Items', 20, 115);
    const topItemsTable = topSellingItemsData.map((item) => [
      item.name,
      `₱${item.value.toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Item Name', 'Revenue']],
      body: topItemsTable,
    });

    // Lowest Selling Items Table
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text('Lowest Selling Items', 20, finalY);
    const lowestItemsTable = lowestSellingItemsData.map((item) => [
      item.name,
      `₱${item.value.toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: finalY + 10,
      head: [['Item Name', 'Revenue']],
      body: lowestItemsTable,
    });

    doc.save('menu-analytics-report.pdf');
  };

  const generatePaymentReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.text('Payment Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    // Payment Summary
    doc.setFontSize(16);
    doc.text('Payment Method Summary', 20, 50);

    const mostPopular = paymentMethodData[0];
    const digitalPayments =
      (paymentMethodData.find((p) => p.name === 'Card')?.value || 0) +
      (paymentMethodData.find((p) => p.name === 'Mobile')?.value || 0);
    const totalPayments = paymentMethodData.reduce(
      (acc, p) => acc + p.value,
      0
    );
    const digitalPercentage = Math.round(
      (digitalPayments / totalPayments) * 100
    );
    const cashPercentage = Math.round(
      ((paymentMethodData.find((p) => p.name === 'Cash')?.value || 0) /
        totalPayments) *
        100
    );

    doc.setFontSize(12);
    doc.text(`Most Popular: ${mostPopular?.name}`, 20, 65);
    doc.text(`Total: ₱${mostPopular?.value.toFixed(2)}`, 20, 75);
    doc.text(`Digital Payments: ${digitalPercentage}%`, 20, 85);
    doc.text(`Cash Transactions: ${cashPercentage}%`, 20, 95);

    // Payment Breakdown Table
    doc.text('Payment Method Breakdown', 20, 115);
    const paymentTable = paymentMethodData.map((item) => [
      item.name,
      `₱${item.value.toFixed(2)}`,
      `${Math.round((item.value / totalPayments) * 100)}%`,
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Payment Method', 'Amount', 'Percentage']],
      body: paymentTable,
    });

    doc.save('payment-analytics-report.pdf');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-semibold">Sales Analytics</h2>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="menu">Menu Reports</TabsTrigger>
          <TabsTrigger value="payment">Payment Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Financial Analytics</h3>
            <Button onClick={generateFinancialReport} className="gap-2">
              <Download className="h-4 w-4" />
              Generate PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales</CardTitle>
                <CardDescription>
                  Sales data for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailySalesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      activeDot={{
                        r: 8,
                      }}
                      name="Sales (₱)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>
                  6-month sales and order trends
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyComparison}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Sales (₱)"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="Total Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Key financial indicators for your canteen
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Total Sales
                </h3>
                <p className="text-2xl font-bold">
                  ₱
                  {salesData
                    .reduce((acc, sale) => acc + sale.total, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Total Orders
                </h3>
                <p className="text-2xl font-bold">{salesData.length}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Average Order Value
                </h3>
                <p className="text-2xl font-bold">
                  ₱
                  {(
                    salesData.reduce((acc, sale) => acc + sale.total, 0) /
                    salesData.length
                  ).toFixed(2)}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Monthly Growth
                </h3>
                <p className="text-2xl font-bold text-green-600">+23%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Menu Analytics</h3>
            <Button onClick={generateMenuReport} className="gap-2">
              <Download className="h-4 w-4" />
              Generate PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>
                  Items with the highest sales revenue
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSellingItemsData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip
                      formatter={(value) => {
                        const formattedValue =
                          typeof value === 'number'
                            ? `₱${value.toFixed(2)}`
                            : `₱${value}`;
                        return [formattedValue, 'Revenue'];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Revenue (₱)"
                      fill="hsl(var(--primary))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lowest Selling Items</CardTitle>
                <CardDescription>
                  Items that need attention or promotion
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={lowestSellingItemsData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip
                      formatter={(value) => {
                        const formattedValue =
                          typeof value === 'number'
                            ? `₱${value.toFixed(2)}`
                            : `₱${value}`;
                        return [formattedValue, 'Revenue'];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Revenue (₱)"
                      fill="hsl(var(--destructive))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu Performance Insights</CardTitle>
              <CardDescription>
                Analysis of menu item performance
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Best Performer
                </h3>
                <p className="text-xl font-bold mb-1">
                  {topSellingItemsData[0]?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  ₱{topSellingItemsData[0]?.value.toFixed(2)} revenue
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Needs Attention
                </h3>
                <p className="text-xl font-bold mb-1">
                  {lowestSellingItemsData[0]?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  ₱{lowestSellingItemsData[0]?.value.toFixed(2)} revenue
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Total Menu Items
                </h3>
                <p className="text-2xl font-bold mb-1">{menuItems.length}</p>
                <p className="text-sm text-muted-foreground">Active items</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Payment Analytics</h3>
            <Button onClick={generatePaymentReport} className="gap-2">
              <Download className="h-4 w-4" />
              Generate PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Payment Method</CardTitle>
                <CardDescription>
                  Distribution of sales by payment type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => {
                        const formattedValue =
                          typeof value === 'number'
                            ? `₱${value.toFixed(2)}`
                            : `₱${value}`;
                        return [formattedValue, 'Amount'];
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis by payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paymentMethodData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => {
                        const formattedValue =
                          typeof value === 'number'
                            ? `₱${value.toFixed(2)}`
                            : `₱${value}`;
                        return [formattedValue, 'Amount'];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Sales (₱)"
                      fill="hsl(var(--secondary))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Insights</CardTitle>
              <CardDescription>
                Key insights about payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Most Popular
                </h3>
                <p className="text-2xl font-bold mb-1">
                  {paymentMethodData[0]?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  ₱{paymentMethodData[0]?.value.toFixed(2)} total
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Digital Payments
                </h3>
                <p className="text-2xl font-bold mb-1">
                  {Math.round(
                    (((paymentMethodData.find((p) => p.name === 'Card')
                      ?.value || 0) +
                      (paymentMethodData.find((p) => p.name === 'Mobile')
                        ?.value || 0)) /
                      paymentMethodData.reduce((acc, p) => acc + p.value, 0)) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Of total sales</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Cash Transactions
                </h3>
                <p className="text-2xl font-bold mb-1">
                  {Math.round(
                    ((paymentMethodData.find((p) => p.name === 'Cash')?.value ||
                      0) /
                      paymentMethodData.reduce((acc, p) => acc + p.value, 0)) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Of total sales</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;
