import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { salesData, menuItems } from '@/utils/mockData';
import {
  groupSalesByDate,
  getSalesByPaymentMethod,
  getTopSellingItems,
  getLowestSellingItems,
} from '@/utils/salesUtils';
import { peakHoursData, monthlyComparison, mockPayments } from '@/data/salesMockData';
import FinancialReport from './sales/FinancialReport';
import MenuReport from './sales/MenuReport';
import PaymentReport from './sales/PaymentReport';

const SalesAnalytics = () => {
  const [dateRange, setDateRange] = useState('week');
  const [payments, setPayments] = useState(mockPayments);

  // Process data for reports
  const dailySalesData = groupSalesByDate(salesData);
  const paymentMethodData = getSalesByPaymentMethod(salesData);
  const topSellingItemsData = getTopSellingItems(salesData);
  const lowestSellingItemsData = getLowestSellingItems(salesData);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-semibold">Sales Analytics</h2>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="menu">Menu Reports</TabsTrigger>
          <TabsTrigger value="payment">Payment Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-6">
          <FinancialReport
            dailySalesData={dailySalesData}
            monthlyComparison={monthlyComparison}
            peakHoursData={peakHoursData}
          />
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <MenuReport
            topSellingItemsData={topSellingItemsData}
            lowestSellingItemsData={lowestSellingItemsData}
            menuItems={menuItems}
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <PaymentReport
            paymentMethodData={paymentMethodData}
            payments={payments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;
