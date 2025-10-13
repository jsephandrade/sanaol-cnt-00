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
import { ChartContainer } from '@/components/ui/chart';
import { ResponsivePie } from '@/components/charts';
import { AnalyticsLegend, AnalyticsTooltip } from '@/features/analytics/common/chartElements';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const PaymentReport = ({ paymentMethodData, payments }) => {
  const chartData = useMemo(
    () =>
      paymentMethodData.map((entry, index) => ({
        id: entry.name,
        label: entry.name,
        value: entry.value,
        color: COLORS[index % COLORS.length],
        data: entry,
      })),
    [paymentMethodData]
  );

  const chartConfig = useMemo(
    () =>
      paymentMethodData.reduce((acc, entry, index) => {
        const color = COLORS[index % COLORS.length];
        acc[entry.name] = { label: entry.name, color };
        return acc;
      }, {}),
    [paymentMethodData]
  );

  const legendPayload = useMemo(
    () =>
      chartData.map((entry) => ({
        dataKey: entry.id,
        value: entry.label,
        color: entry.color,
        payload: { fill: entry.color },
      })),
    [chartData]
  );

  const totalPayments = useMemo(
    () => paymentMethodData.reduce((acc, p) => acc + (p.value || 0), 0),
    [paymentMethodData]
  );

  const getTotalAmount = (status = 'all') =>
    payments
      .filter((payment) => status === 'all' || payment.status === status)
      .reduce((total, payment) => {
        if (payment.status === 'refunded') return total;
        return total + payment.amount;
      }, 0);

  const generatePaymentReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text('Payment Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    doc.setFontSize(16);
    doc.text('Payment Method Summary', 20, 50);

    const mostPopular = paymentMethodData[0];
    const digitalPayments =
      (paymentMethodData.find((p) => p.name === 'Card')?.value || 0) +
      (paymentMethodData.find((p) => p.name === 'Mobile')?.value || 0);
    const total = totalPayments;
    const digitalPercentage = total ? Math.round((digitalPayments / total) * 100) : 0;
    const cashPercentage = total
      ? Math.round(
          ((paymentMethodData.find((p) => p.name === 'Cash')?.value || 0) / total) * 100
        )
      : 0;

    doc.setFontSize(12);
    doc.text(`Most Popular: ${mostPopular?.name ?? 'N/A'}`, 20, 65);
    doc.text(`Total: ${formatCurrency(mostPopular?.value ?? 0)}`, 20, 75);
    doc.text(`Digital Payments: ${digitalPercentage}%`, 20, 85);
    doc.text(`Cash Transactions: ${cashPercentage}%`, 20, 95);

    doc.text('Payment Method Breakdown', 20, 115);
    const paymentTable = paymentMethodData.map((item) => [
      item.name,
      formatCurrency(item.value),
      total ? `${Math.round((item.value / total) * 100)}%` : '0%',
    ]);

    doc.autoTable({
      startY: 125,
      head: [['Payment Method', 'Amount', 'Percentage']],
      body: paymentTable,
    });

    doc.save('payment-analytics-report.pdf');
  };

  const renderTooltip = ({ datum }) => {
    if (!datum) return null;
    const percentage = totalPayments ? (datum.value / totalPayments) * 100 : 0;
    const payloadEntry = {
      dataKey: datum.id,
      name: datum.label,
      value: datum.value,
      color: datum.color,
      payload: {
        ...datum.data,
        percentage,
        fill: datum.color,
      },
    };
    return (
      <AnalyticsTooltip
        active
        payload={[payloadEntry]}
        label={datum.label}
        formatter={(value) =>
          `${formatCurrency(value)} (${Math.round(percentage)}%)`
        }
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Payment Analytics</h3>
        <Button onClick={generatePaymentReport} className="gap-2">
          <Download className="h-4 w-4" />
          Generate PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>How customers prefer to pay</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              className="h-full"
              config={chartConfig}
              aria-label="Payment method distribution"
            >
              <ResponsivePie
                data={chartData}
                margin={{ top: 8, right: 16, bottom: 48, left: 16 }}
                innerRadius={0.5}
                padAngle={2}
                cornerRadius={6}
                activeOuterRadiusOffset={8}
                colors={(datum) => datum.data.color}
                enableArcLinkLabels={false}
                arcLabelsSkipAngle={12}
                arcLabel={(datum) =>
                  `${datum.label} ${Math.round(
                    totalPayments ? (datum.value / totalPayments) * 100 : 0
                  )}%`
                }
                arcLabelsTextColor="var(--foreground)"
                tooltip={renderTooltip}
                theme={{
                  labels: {
                    text: {
                      fill: 'var(--foreground)',
                      fontSize: 11,
                    },
                  },
                }}
                role="img"
                ariaLabel="Payment method donut chart"
              />
              <AnalyticsLegend className="pt-2" payload={legendPayload} />
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>
              Total transactions and amounts by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Completed Payments</span>
                <span className="text-green-600 font-bold">
                  {formatCurrency(getTotalAmount('completed'))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">Failed Payments</span>
                <span className="text-red-600 font-bold">
                  {formatCurrency(getTotalAmount('failed'))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Refunded Payments</span>
                <span className="text-orange-600 font-bold">
                  {formatCurrency(getTotalAmount('refunded'))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
                <span className="font-bold">Total Revenue</span>
                <span className="text-blue-600 font-bold text-lg">
                  {formatCurrency(getTotalAmount('all'))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReport;
