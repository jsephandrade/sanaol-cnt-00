import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../common/ChartCard';
import { currency } from '../common/utils';

export default function OrdersRevenueChart({ data, loading, error }) {
  return (
    <ChartCard
      className="col-span-1 lg:col-span-2"
      title="Orders vs Revenue"
      description="Daily orders (line) against revenue (bars)"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No transaction history available."
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={44} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            width={44}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue' ? currency(value) : value
            }
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="hsl(var(--foreground))"
            strokeWidth={1.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
