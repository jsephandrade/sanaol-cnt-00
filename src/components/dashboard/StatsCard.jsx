import React from 'react';
import { MetricCard } from '@/features/analytics/common';

const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  formatter = (v) => v,
  onClick,
  helper,
  loading = false,
  disabled = false,
}) => {
  const formattedValue = loading ? '--' : formatter(value);
  return (
    <MetricCard
      label={title}
      value={formattedValue}
      trend={change}
      icon={Icon}
      onClick={onClick}
      helper={helper}
      loading={loading}
      disabled={disabled}
      className="min-h-[120px]"
    />
  );
};

export default StatsCard;
