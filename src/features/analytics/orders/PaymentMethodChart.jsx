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
import { currency } from '../common/utils';

export default function PaymentMethodChart({ data, loading, error }) {
  return (
    <ChartCard
      title="Transactions by Method"
      description="Distribution of payment methods"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No transaction history available."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={44} />
          <Tooltip formatter={(value) => currency(value)} />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
