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
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  Search,
  PlusCircle,
  ArrowUpDown,
  MoreVertical,
  PenSquare,
  Ban,
  History,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AddItemModal from '@/components/inventory/AddItemModal';
import EditItemModal from '@/components/inventory/EditItemModal';
import InventoryHeader from '@/components/inventory/InventoryHeader';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryTabs from '@/components/inventory/InventoryTabs';
import InventoryFooter from '@/components/inventory/InventoryFooter';
import InventoryModals from '@/components/inventory/InventoryModals';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [inventoryItems, setInventoryItems] = useState([
    {
      id: '1',
      name: 'Rice',
      category: 'Grains',
      currentStock: 25,
      minThreshold: 10,
      unit: 'kg',
      lastUpdated: '2025-04-15',
      supplier: 'Global Foods',
    },
    {
      id: '2',
      name: 'Chicken Breast',
      category: 'Meat',
      currentStock: 8,
      minThreshold: 5,
      unit: 'kg',
      lastUpdated: '2025-04-16',
      supplier: 'Fresh Farms',
    },
    {
      id: '3',
      name: 'Olive Oil',
      category: 'Condiments',
      currentStock: 2,
      minThreshold: 3,
      unit: 'bottles',
      lastUpdated: '2025-04-16',
      supplier: 'Gourmet Supplies',
    },
    {
      id: '4',
      name: 'Tomatoes',
      category: 'Vegetables',
      currentStock: 15,
      minThreshold: 8,
      unit: 'kg',
      lastUpdated: '2025-04-17',
      supplier: 'Local Farms',
    },
    {
      id: '5',
      name: 'Flour',
      category: 'Baking',
      currentStock: 12,
      minThreshold: 5,
      unit: 'kg',
      lastUpdated: '2025-04-14',
      supplier: "Baker's Choice",
    },
    {
      id: '6',
      name: 'Salt',
      category: 'Condiments',
      currentStock: 4,
      minThreshold: 2,
      unit: 'kg',
      lastUpdated: '2025-04-13',
      supplier: 'Seasoning Co.',
    },
    {
      id: '7',
      name: 'Milk',
      category: 'Dairy',
      currentStock: 6,
      minThreshold: 8,
      unit: 'liters',
      lastUpdated: '2025-04-17',
      supplier: 'Dairy Farms',
    },
  ]);

  const recentActivities = [
    {
      id: '1',
      action: 'Stock Update',
      item: 'Rice',
      quantity: '+50kg',
      timestamp: '2025-04-22 14:30',
      user: 'John Smith',
    },
    {
      id: '2',
      action: 'Stock Deduction',
      item: 'Chicken Breast',
      quantity: '-15kg',
      timestamp: '2025-04-22 13:45',
      user: 'Maria Garcia',
    },
    {
      id: '3',
      action: 'Low Stock Alert',
      item: 'Olive Oil',
      quantity: '2 bottles remaining',
      timestamp: '2025-04-22 12:20',
      user: 'System',
    },
    {
      id: '4',
      action: 'Inventory Count',
      item: 'Tomatoes',
      quantity: 'Updated to 15kg',
      timestamp: '2025-04-22 11:00',
      user: 'David Chen',
    },
  ];

  const categories = [
    'Grains',
    'Meat',
    'Vegetables',
    'Dairy',
    'Condiments',
    'Baking',
    'Fruits',
  ];

  const filteredItems = inventoryItems.filter((item) => {
    // Filter by search term
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by category
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Items that are below threshold
  const lowStockItems = inventoryItems.filter(
    (item) => item.currentStock < item.minThreshold
  );

  // Calculate stock level percentage
  const getStockPercentage = (current, threshold) => {
    return Math.min(100, Math.round((current / (threshold * 2)) * 100));
  };

  // Determine badge color based on stock level
  const getStockBadgeVariant = (current, threshold) => {
    if (current <= threshold * 0.5) return 'destructive';
    if (current <= threshold) return 'warning';
    return 'success';
  };

  // Get text for stock status
  const getStockStatusText = (current, threshold) => {
    if (current <= threshold * 0.5) return 'Critical';
    if (current <= threshold) return 'Low';
    if (current >= threshold * 2) return 'Overstocked';
    return 'Good';
  };

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
          <InventoryHeader onAddItem={() => setShowAddModal(true)} />
          <CardContent className="space-y-4">
            <InventoryFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />

            <InventoryTabs
              filteredItems={filteredItems}
              onEditItem={handleEditItem}
              onDisableItem={handleDisableItem}
              getStockPercentage={getStockPercentage}
              getStockBadgeVariant={getStockBadgeVariant}
              getStockStatusText={getStockStatusText}
            />
          </CardContent>
          <InventoryFooter
            filteredCount={filteredItems.length}
            totalCount={inventoryItems.length}
          />
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Inventory Activity</CardTitle>
            <CardDescription>
              Latest inventory changes and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="bg-muted rounded-full p-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.item} • {activity.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      By {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingItem={editingItem}
        onAddItem={handleAddItem}
        onEditItem={handleUpdateItem}
      />
    </div>
  );
};

export default Inventory;
