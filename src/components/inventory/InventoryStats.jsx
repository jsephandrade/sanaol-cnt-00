import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Package, CheckCircle } from 'lucide-react';

const InventoryStats = ({ lowStockItems, totalItems }) => {
  const criticalItems = lowStockItems.filter(
    (item) => item.currentStock <= item.minThreshold * 0.5
  );

  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      description: 'Items in inventory',
      icon: Package,
      variant: 'default',
    },
    {
      title: 'Low Stock',
      value: lowStockItems.length,
      description: 'Items below threshold',
      icon: TrendingDown,
      variant: 'warning',
    },
    {
      title: 'Critical',
      value: criticalItems.length,
      description: 'Items needing immediate attention',
      icon: AlertTriangle,
      variant: 'destructive',
    },
    {
      title: 'Well Stocked',
      value: totalItems - lowStockItems.length,
      description: 'Items above threshold',
      icon: CheckCircle,
      variant: 'success',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Overview</CardTitle>
        <CardDescription>Current stock status summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <Badge variant={stat.variant} className="text-xs">
                      {stat.title}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStats;