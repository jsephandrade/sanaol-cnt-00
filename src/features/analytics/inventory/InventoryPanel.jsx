import React, { useMemo } from 'react';
import { useInventoryReport } from '@/hooks/useReports';
import InventoryStockLevelsChart from './InventoryStockLevelsChart';
import InventoryLowStockChart from './InventoryLowStockChart';
import InventoryLowStockTable from './InventoryLowStockTable';

export default function InventoryPanel() {
  const { data: items = [], loading, error } = useInventoryReport();

  const qtyByItem = useMemo(
    () =>
      items.map((item) => ({
        name: item.name || 'Unnamed Item',
        qty: Number(item.quantity ?? 0),
        unit: item.unit || '',
      })),
    [items]
  );

  const lowStockItems = useMemo(
    () =>
      items.filter((item) => {
        const min = Number(item.minStock ?? 0);
        if (!Number.isFinite(min) || min <= 0) return false;
        return Number(item.quantity ?? 0) <= min;
      }),
    [items]
  );

  const okCount = Math.max(items.length - lowStockItems.length, 0);

  const pieData = useMemo(() => {
    if (!items.length) return [];
    const slices = [
      {
        name: 'Low',
        value: lowStockItems.length,
        color: 'hsl(var(--destructive))',
      },
      { name: 'OK', value: okCount, color: 'hsl(var(--primary))' },
    ];
    return slices.filter((slice) => slice.value > 0);
  }, [items.length, lowStockItems.length, okCount]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <InventoryStockLevelsChart
        data={qtyByItem}
        loading={loading}
        error={error}
      />
      <InventoryLowStockChart data={pieData} loading={loading} error={error} />
      <InventoryLowStockTable
        items={lowStockItems}
        loading={loading}
        error={error}
      />
    </div>
  );
}
