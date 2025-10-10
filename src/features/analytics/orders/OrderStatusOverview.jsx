import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatMethodLabel } from '../common/utils';

export default function OrderStatusOverview({ entries, loading, error }) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Order Status Overview</CardTitle>
        <CardDescription>Total counts by order status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No order status data available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {entries.map((entry) => (
              <div
                key={entry.status}
                className="rounded-lg border bg-muted/40 p-3"
              >
                <p className="text-xs text-muted-foreground">
                  {formatMethodLabel(entry.status)}
                </p>
                <p className="text-xl font-semibold">
                  {entry.count.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
