import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import panel components
import SalesPanel from '@/components/analytics/panels/SalesPanel';
import InventoryPanel from '@/components/analytics/panels/InventoryPanel';
import OrdersPanel from '@/components/analytics/panels/OrdersPanel';
import AttendancePanel from '@/components/analytics/panels/AttendancePanel';
import CateringPanel from '@/components/analytics/panels/CateringPanel';

export default function SalesAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="inline-flex flex-wrap gap-2 justify-start w-fit">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="orders">Orders & Transactions</TabsTrigger>
          <TabsTrigger value="attendance">Staff Attendance</TabsTrigger>
          <TabsTrigger value="catering">Catering Analytics</TabsTrigger>
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

        <TabsContent value="catering" className="mt-6">
          <CateringPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
