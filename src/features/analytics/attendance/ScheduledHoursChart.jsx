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

export default function ScheduledHoursChart({ data, loading, error }) {
  return (
    <ChartCard
      className="lg:col-span-2"
      title="Scheduled Hours by Staff"
      description="Sum of weekly scheduled hours"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No schedule data available."
      heightClass="h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 11 }} width={44} />
          <Tooltip formatter={(value) => `${value} hrs`} />
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
