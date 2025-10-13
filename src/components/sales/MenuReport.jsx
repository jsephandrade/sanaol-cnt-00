import React, { useMemo } from 'react';
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
import BarCategory from '@/features/analytics/common/BarCategory';
import Donut from '@/features/analytics/common/Donut';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const MenuReport = ({ topSellingItemsData, lowestSellingItemsData, menuItems }) => {
  const generateMenuReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text('Menu Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    doc.setFontSize(16);
    doc.text('Menu Performance Summary', 20, 50);

    doc.setFontSize(12);
    doc.text(`Best Performer: ${topSellingItemsData[0]?.name ?? 'N/A'}`, 20, 65);
    doc.text(
      `Revenue: ${formatCurrency(topSellingItemsData[0]?.value ?? 0)}`,
      20,
      75
    );
    doc.text(
      `Needs Attention: ${lowestSellingItemsData[0]?.name ?? 'N/A'}`,
      20,
      85
    );
    doc.text(`Total Menu Items: ${menuItems.length}`, 20, 95);

    doc.text('Top Selling Items', 20, 115);
    const topItemsTable = topSellingItemsData.map((item) => [
      item.name,
      formatCurrency(item.value),
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Item Name', 'Revenue']],
      body: topItemsTable,
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text('Lowest Selling Items', 20, finalY);
    const lowestItemsTable = lowestSellingItemsData.map((item) => [
      item.name,
      formatCurrency(item.value),
    ]);

    doc.autoTable({
      startY: finalY + 10,
      head: [['Item Name', 'Revenue']],
      body: lowestItemsTable,
    });

    doc.save('menu-analytics-report.pdf');
  };

  const donutData = useMemo(
    () =>
      topSellingItemsData.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
      })),
    [topSellingItemsData]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
              Best performing menu items by revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarCategory
              data={topSellingItemsData}
              xKey="name"
              margin={{ top: 24, right: 24, bottom: 48, left: 48 }}
              tooltipFormatter={(value) => formatCurrency(value)}
              tooltipLabelFormatter={(label) => label}
              series={[
                {
                  key: 'value',
                  label: 'Revenue (₱)',
                  color: 'hsl(var(--primary))',
                },
              ]}
              yAxisProps={{
                tickFormatter: (value) => formatCurrency(value),
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Item Distribution</CardTitle>
            <CardDescription>
              Revenue distribution across top items
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Donut
              data={donutData}
              valueKey="value"
              nameKey="name"
              legend
              legendProps={{ align: 'center', verticalAlign: 'bottom' }}
              tooltipFormatter={(value, name, payload) => (
                <div className="flex w-full items-center justify-between leading-none">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(value)}
                    {payload?.percentage
                      ? ` · ${Math.round(payload.percentage)}%`
                      : ''}
                  </span>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items Needing Attention</CardTitle>
          <CardDescription>
            Lowest performing menu items that may need promotion or review
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <BarCategory
            data={lowestSellingItemsData}
            xKey="name"
            margin={{ top: 24, right: 24, bottom: 48, left: 48 }}
            tooltipFormatter={(value) => formatCurrency(value)}
            tooltipLabelFormatter={(label) => label}
            series={[
              {
                key: 'value',
                label: 'Revenue (₱)',
                color: 'hsl(var(--destructive))',
              },
            ]}
            yAxisProps={{
              tickFormatter: (value) => formatCurrency(value),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuReport;
