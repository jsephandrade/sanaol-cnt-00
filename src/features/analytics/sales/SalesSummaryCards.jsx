import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { currency, RANGE_OPTIONS } from '../common/utils';

export default function SalesSummaryCards({
  summary,
  topMethodLabel,
  range,
  setRange,
  loading,
  error,
}) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Key Metrics</CardTitle>
            <CardDescription>
              Revenue and order trends sourced from live transactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={option.value === range ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs font-medium"
                onClick={() => {
                  if (option.value !== range) setRange(option.value);
                }}
                disabled={loading && option.value === range}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryTile
            label="Total Revenue"
            value={loading ? '--' : currency(summary.totalRevenue)}
          />
          <SummaryTile
            label="Total Orders"
            value={loading ? '--' : summary.totalOrders.toLocaleString()}
          />
          <SummaryTile
            label="Avg. Order Value"
            value={loading ? '--' : currency(summary.averageOrderValue)}
          />
          <SummaryTile label="Top Payment Method" value={topMethodLabel} />
        </div>
        {error ? (
          <p className="mt-3 text-xs text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
