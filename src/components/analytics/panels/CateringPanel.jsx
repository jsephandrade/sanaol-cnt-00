import React, { useEffect, useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts';
import { cateringService } from '@/api/services/cateringService';
import {
  CHART_STYLES,
  CHART_COLORS,
  CHART_MARGINS,
  ANIMATION_CONFIG,
  CustomCurrencyTooltip,
  formatCompactCurrency,
} from '@/utils/chartConfig';

const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function CateringPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCateringData = async () => {
      try {
        setLoading(true);
        const response = await cateringService.listEvents();
        setEvents(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching catering data:', err);
        setError(err.message || 'Failed to load catering data');
      } finally {
        setLoading(false);
      }
    };

    fetchCateringData();
  }, []);

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    if (!events.length) return [];
    const map = {};
    events.forEach((event) => {
      if (event.status === 'cancelled') return;
      const date = new Date(event.eventDate);
      const monthYear = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const amount = Number(event.totalAmount || 0);
      map[monthYear] = (map[monthYear] || 0) + amount;
    });
    return Object.entries(map)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [events]);

  // Events by status
  const eventsByStatus = useMemo(() => {
    if (!events.length) return [];
    const statusCount = {};
    events.forEach((event) => {
      const status = event.status || 'pending';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
  }, [events]);

  // Summary stats
  const stats = useMemo(() => {
    const totalRevenue = events
      .filter((e) => e.status !== 'cancelled')
      .reduce((sum, e) => sum + Number(e.totalAmount || 0), 0);
    const confirmedEvents = events.filter(
      (e) => e.status === 'confirmed'
    ).length;
    const pendingEvents = events.filter((e) => e.status === 'pending').length;
    const completedEvents = events.filter(
      (e) => e.status === 'completed'
    ).length;

    return {
      totalRevenue,
      confirmedEvents,
      pendingEvents,
      completedEvents,
      totalEvents: events.length,
    };
  }, [events]);

  if (loading) {
    return <div className="p-6 text-center">Loading catering data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        Error loading catering data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">
              {currency(stats.totalRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-2xl">{stats.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Confirmed Events</CardDescription>
            <CardTitle className="text-2xl">{stats.confirmedEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>Pending Events</CardDescription>
            <CardTitle className="text-2xl">{stats.pendingEvents}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Revenue Over Time
            </CardTitle>
            <CardDescription>Monthly catering revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {revenueByMonth.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueByMonth}
                  margin={CHART_MARGINS.default}
                  {...ANIMATION_CONFIG.entrance}
                >
                  <defs>
                    <linearGradient
                      id="revenueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                    opacity={CHART_STYLES.grid.opacity}
                  />
                  <XAxis dataKey="name" tick={CHART_STYLES.axisTick} />
                  <YAxis
                    tick={CHART_STYLES.axisTick}
                    width={50}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: CHART_COLORS.primary,
                      strokeWidth: 2,
                      stroke: 'hsl(var(--background))',
                    }}
                    activeDot={{
                      r: 6,
                      fill: CHART_COLORS.primary,
                      strokeWidth: 2,
                      stroke: 'hsl(var(--background))',
                    }}
                    fill="url(#revenueGrad)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Events by Status */}
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Events by Status
            </CardTitle>
            <CardDescription>Distribution of event statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {eventsByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No event data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventsByStatus}
                  margin={CHART_MARGINS.default}
                  {...ANIMATION_CONFIG.entrance}
                >
                  <CartesianGrid
                    strokeDasharray={CHART_STYLES.grid.strokeDasharray}
                    opacity={CHART_STYLES.grid.opacity}
                  />
                  <XAxis dataKey="status" tick={CHART_STYLES.axisTick} />
                  <YAxis tick={CHART_STYLES.axisTick} width={40} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Events</CardTitle>
          <CardDescription>Latest catering event bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No catering events found
                    </TableCell>
                  </TableRow>
                ) : (
                  events
                    .sort(
                      (a, b) => new Date(b.eventDate) - new Date(a.eventDate)
                    )
                    .slice(0, 10)
                    .map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.eventName || '—'}
                        </TableCell>
                        <TableCell>
                          {new Date(event.eventDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{event.customerName || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {event.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {currency(event.totalAmount || 0)}
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
