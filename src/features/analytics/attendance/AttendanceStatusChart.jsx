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

export default function AttendanceStatusChart({ data, loading, error }) {
  return (
    <ChartCard
      title="Attendance Status Distribution"
      description="Counts of recorded attendance statuses"
      loading={loading}
      error={error}
      data={data}
      emptyMessage="No attendance status data available."
      heightClass="h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
          <YAxis tick={{ fontSize: 11 }} width={44} />
          <Tooltip />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
