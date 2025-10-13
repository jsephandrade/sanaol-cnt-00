import React, { useMemo } from 'react';
import { ChartCard, Donut } from '../common';
import { formatPercent } from '../common/utils';

export default function AttendanceStatusChart({ data, loading, error }) {
  const total = useMemo(
    () =>
      data.reduce(
        (sum, item) => sum + Number(item.value || item.count || 0),
        0
      ),
    [data]
  );

  const renderTooltip = (value, name) => {
    const formatted = Number(value || 0).toLocaleString();
    const percent = total ? formatPercent(value, total) : null;
    return (
      <div className="flex w-full items-center justify-between leading-none">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-mono font-medium text-foreground">
          {formatted}
          {percent ? ` · ${percent}` : ''}
        </span>
      </div>
    );
  };

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
      <Donut data={data} legend tooltipProps={{ formatter: renderTooltip }} />
    </ChartCard>
  );
}
