import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '../common/ChartCard';
import { currency } from '../common/utils';

export default function CustomerHistoryChart({ data, loading, error }) {
  return (
    <ChartCard
      className="col-span-1 lg:col-span-2"
      title="Purchases Over Time"
      description="Total customer spend per day"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No purchase history available."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={44} />
          <Tooltip formatter={(value) => currency(value)} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
