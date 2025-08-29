import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const TICK_STYLE = {
  fontSize: 10,
  fill: "hsl(var(--muted-foreground))"
};

const CategoryChart = ({ data, title, description }) => {
  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-44 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: 16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={TICK_STYLE}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={TICK_STYLE}
              width={44}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />
            <Tooltip
              wrapperStyle={{ fontSize: 11 }}
              labelStyle={{ fontSize: 11 }}
              contentStyle={{ padding: "6px 8px" }}
            />
            <Bar
              dataKey="amount"
              fill="hsl(var(--secondary))"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;