import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  CHART_STYLES,
  CHART_GRADIENTS,
  CHART_MARGINS,
  ANIMATION_CONFIG,
  CustomCurrencyTooltip,
  formatCompactCurrency,
} from '@/utils/chartConfig';

const SalesChart = ({ data, title, description }) => {
  const gradient = CHART_GRADIENTS.revenue();

  return (
    <Card className="border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {description}
            </CardDescription>
          </div>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="h-56 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={CHART_MARGINS.default}
            {...ANIMATION_CONFIG.entrance}
          >
            <defs>
              {gradient.definition}
            </defs>
            <CartesianGrid
              strokeDasharray={CHART_STYLES.grid.strokeDasharray}
              opacity={CHART_STYLES.grid.opacity}
              stroke={CHART_STYLES.grid.stroke}
            />
            <XAxis
              dataKey="name"
              tick={CHART_STYLES.axisTick}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={CHART_STYLES.axisTick}
              width={50}
              axisLine={false}
              tickLine={false}
              tickCount={5}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip
              content={<CustomCurrencyTooltip />}
              cursor={CHART_STYLES.tooltip.cursor}
              animationDuration={200}
            />
            <Legend
              wrapperStyle={{
                fontSize: '11px',
                paddingTop: '8px',
              }}
              iconType="line"
            />
            {/* Today's sales - Blue area chart with gradient */}
            <Area
              type="monotone"
              dataKey="today"
              name="Today"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill={`url(#${gradient.id})`}
              dot={false}
              activeDot={{
                ...CHART_STYLES.activeDot,
                fill: 'hsl(var(--primary))',
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
            {/* Yesterday's sales - Gray dashed line */}
            <Line
              type="monotone"
              dataKey="yesterday"
              name="Yesterday"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{
                r: 3,
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'hsl(var(--muted-foreground))',
              }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;