import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useEmployees, useSchedule } from '@/hooks/useEmployees';
import {
  CHART_STYLES,
  CHART_COLORS,
  ANIMATION_CONFIG,
  CustomNumericTooltip,
  formatHours,
} from '@/utils/chartConfig';

const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function AttendancePanel() {
  const { employees } = useEmployees();
  const { schedule } = useSchedule();

  const toHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = String(start).split(':').map(Number);
    const [eh, em] = String(end).split(':').map(Number);
    if (Number.isNaN(sh) || Number.isNaN(eh)) return 0;
    return eh + (em || 0) / 60 - (sh + (sm || 0) / 60);
  };

  const hours = useMemo(() => {
    const nameById = Object.fromEntries(employees.map((e) => [e.id, e.name]));
    const map = {};
    for (const s of schedule) {
      const h = toHours(s.startTime, s.endTime);
      const name = s.employeeName || nameById[s.employeeId] || 'Unknown';
      map[name] = (map[name] || 0) + h;
    }
    return Object.entries(map).map(([name, hrs]) => ({
      name,
      hours: Math.round(hrs * 10) / 10,
    }));
  }, [employees, schedule]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Scheduled Hours by Staff</CardTitle>
          <CardDescription>Sum of weekly scheduled hours</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hours}
              margin={{ left: 8, right: 8, top: 8, bottom: 40 }}
              {...ANIMATION_CONFIG.entrance}
            >
              <CartesianGrid
                strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                opacity={CHART_STYLES.grid.opacity}
              />
              <XAxis
                dataKey="name"
                tick={CHART_STYLES.axisTick}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={CHART_STYLES.axisTick}
                width={44}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                content={<CustomNumericTooltip valueFormatter={(v) => formatHours(v)} />}
              />
              <Bar
                dataKey="hours"
                name="Hours"
                radius={[6, 6, 0, 0]}
                fill={CHART_COLORS.info}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="hours"
                  position="top"
                  formatter={(value) => `${value}h`}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Staff Roster</CardTitle>
          <CardDescription>Key roles and hourly rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Hourly Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No employee data available
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.slice(0, 6).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.position}</TableCell>
                      <TableCell className="text-right">
                        {currency(e.hourlyRate)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
