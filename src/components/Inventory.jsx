import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AddItemModal from '@/components/inventory/AddItemModal';
import EditItemModal from '@/components/inventory/EditItemModal';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryStats from '@/components/inventory/InventoryStats';
import { InventoryActivity } from '@/components/inventory/InventoryActivity';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryGrid } from '@/components/inventory/InventoryGrid';
import { useInventoryData } from '@/hooks/useInventoryData';
import { filterInventoryItems, getLowStockItems } from '@/utils/inventoryUtils';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Use custom hook for inventory data
  const { inventoryItems, setInventoryItems, recentActivities, categories } = useInventoryData();

  // Filter items using utility function
  const filteredItems = filterInventoryItems(inventoryItems, searchTerm, selectedCategory);
  
  // Get low stock items using utility function
  const lowStockItems = getLowStockItems(inventoryItems);

  const handleAddItem = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0],
      disabled: false,
    };
    setInventoryItems((prev) => [...prev, item]);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = (updatedItem) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDisableItem = (itemId, itemName) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, disabled: !item.disabled } : item
      )
    );

    const item = inventoryItems.find((item) => item.id === itemId);
    if (item) {
      toast.success(
        `${itemName} has been ${item.disabled ? 'enabled' : 'disabled'}`
      );
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Raw Materials Inventory</CardTitle>
              <CardDescription>
                Track and manage inventory items
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="flex gap-1"
              onClick={() => setShowAddModal(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <InventoryFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                <InventoryTable
                  filteredItems={filteredItems}
                  onEditItem={handleEditItem}
                  onDisableItem={handleDisableItem}
                />
              </TabsContent>
              <TabsContent value="grid">
                <InventoryGrid
                  filteredItems={filteredItems}
                  onEditItem={handleEditItem}
                  onDisableItem={handleDisableItem}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t py-3">
            <div className="text-xs text-muted-foreground">
              Showing {filteredItems.length} of {inventoryItems.length} items
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <InventoryStats 
          lowStockItems={lowStockItems} 
          totalItems={inventoryItems.length} 
        />
        
        <InventoryActivity recentActivities={recentActivities} />
      </div>

      <AddItemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddItem={handleAddItem}
      />

      <EditItemModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        item={editingItem}
        onEditItem={handleUpdateItem}
      />
    </div>
  );
};

export default Inventory;
