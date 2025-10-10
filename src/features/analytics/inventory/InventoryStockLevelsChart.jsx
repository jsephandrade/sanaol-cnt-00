import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../common/ChartCard';

export default function InventoryStockLevelsChart({ data, loading, error }) {
  return (
    <ChartCard
      className="col-span-1 lg:col-span-2"
      title="Stock Levels by Item"
      description="Monitor current on-hand quantities"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No inventory records available."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11 }} width={42} />
          <Tooltip />
          <Bar dataKey="qty" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
