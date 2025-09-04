import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryGrid } from '@/components/inventory/InventoryGrid';

const InventoryTabs = ({
  filteredItems,
  onEditItem,
  onDisableItem,
  getStockPercentage,
  getStockBadgeVariant,
  getStockStatusText,
}) => {
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">List View</TabsTrigger>
        <TabsTrigger value="grid">Grid View</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <InventoryTable
          items={filteredItems}
          onEditItem={onEditItem}
          onDisableItem={onDisableItem}
          getStockPercentage={getStockPercentage}
          getStockBadgeVariant={getStockBadgeVariant}
          getStockStatusText={getStockStatusText}
        />
      </TabsContent>
      <TabsContent value="grid">
        <InventoryGrid
          items={filteredItems}
          onEditItem={onEditItem}
          onDisableItem={onDisableItem}
          getStockPercentage={getStockPercentage}
          getStockBadgeVariant={getStockBadgeVariant}
          getStockStatusText={getStockStatusText}
        />
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;

