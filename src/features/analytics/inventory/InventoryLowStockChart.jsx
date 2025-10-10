import React from 'react';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from '../common/ChartCard';

export default function InventoryLowStockChart({ data, loading, error }) {
  return (
    <ChartCard
      title="Low Stock Ratio"
      description="Items at or below minimum"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No inventory records available."
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={64}
            paddingAngle={2}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
