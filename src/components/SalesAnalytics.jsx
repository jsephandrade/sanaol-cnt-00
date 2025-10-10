import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesPanel } from '@/features/analytics/sales';
import { InventoryPanel } from '@/features/analytics/inventory';
import { OrdersPanel } from '@/features/analytics/orders';
import { AttendancePanel } from '@/features/analytics/attendance';
import { CustomersPanel } from '@/features/analytics/customers';

export default function SalesAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold">Analytics</h2>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="inline-flex flex-wrap gap-2 justify-start w-fit">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="orders">Orders &amp; Transactions</TabsTrigger>
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
