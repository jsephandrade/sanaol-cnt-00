import { useState } from 'react';

export const useInventoryData = () => {
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

  return {
    inventoryItems,
    setInventoryItems,
    recentActivities,
    categories,
  };
};