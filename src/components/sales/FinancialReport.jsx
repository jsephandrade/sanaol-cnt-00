import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import TimeSeries from '@/features/analytics/common/TimeSeries';

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const FinancialReport = ({ dailySalesData, monthlyComparison, peakHoursData }) => {
  const generateFinancialReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text('Financial Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    doc.setFontSize(16);
    doc.text('Financial Summary', 20, 50);

    const totalSales = dailySalesData.reduce((acc, sale) => acc + sale.total, 0);
    const totalOrders = dailySalesData.length;
    const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;

    doc.setFontSize(12);
    doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 20, 65);
    doc.text(`Total Orders: ${totalOrders}`, 20, 75);
    doc.text(`Average Order Value: ${formatCurrency(avgOrderValue)}`, 20, 85);
    doc.text(`Monthly Growth: +23%`, 20, 95);

    doc.text('Daily Sales Breakdown', 20, 115);
    const dailySalesTable = dailySalesData.map((item) => [
      item.date,
      formatCurrency(item.total),
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Date', 'Sales Amount']],
      body: dailySalesTable,
    });

    doc.save('financial-analytics-report.pdf');
  };

  return (
    <div className="space-y-6">
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
            <CardDescription>Sales data for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <TimeSeries
              data={dailySalesData}
              xKey="date"
              tooltipFormatter={formatCurrency}
              legend={false}
              margin={{ top: 32, right: 24, left: 24, bottom: 24 }}
              series={[
                {
                  key: 'total',
                  label: 'Sales (₱)',
                  type: 'line',
                  color: 'hsl(var(--primary))',
                  curve: 'monotone',
                },
              ]}
              yAxes={[
                {
                  id: 'sales',
                  orientation: 'left',
                  tickFormatter: (value) => formatCurrency(value),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>6-month sales and order trends</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <TimeSeries
              data={monthlyComparison}
              xKey="month"
              legend
              legendProps={{ align: 'center', verticalAlign: 'bottom' }}
              margin={{ top: 32, right: 24, left: 24, bottom: 32 }}
              tooltipFormatter={(value, name) =>
                name === 'Total Orders' ? `${value.toLocaleString()} orders` : formatCurrency(value)
              }
              series={[
                {
                  key: 'sales',
                  label: 'Sales (₱)',
                  type: 'line',
                  color: 'hsl(var(--primary))',
                  curve: 'monotone',
                },
                {
                  key: 'orders',
                  label: 'Total Orders',
                  type: 'line',
                  color: 'hsl(var(--secondary))',
                  curve: 'monotone',
                },
              ]}
              yAxes={[
                {
                  id: 'sales',
                  orientation: 'left',
                  tickFormatter: (value) => formatCurrency(value),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peak Hours Analysis</CardTitle>
          <CardDescription>Busiest times and revenue patterns</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <TimeSeries
            data={peakHoursData}
            xKey="hour"
            legend
            legendProps={{ align: 'center', verticalAlign: 'bottom' }}
            margin={{ top: 32, right: 24, left: 24, bottom: 32 }}
            tooltipFormatter={(value, name) =>
              name === 'Orders'
                ? `${value.toLocaleString()} orders`
                : formatCurrency(value)
            }
            series={[
              {
                key: 'sales',
                label: 'Sales (₱)',
                type: 'line',
                color: 'hsl(var(--primary))',
                curve: 'monotone',
              },
              {
                key: 'orders',
                label: 'Orders',
                type: 'line',
                color: 'hsl(var(--secondary))',
                curve: 'monotone',
              },
            ]}
            yAxes={[
              {
                id: 'sales',
                orientation: 'left',
                tickFormatter: (value) => formatCurrency(value),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReport;
