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
  accent = 'neutral',
  trendDirection: trendDirectionProp,
}) => {
  const formattedValue = loading ? '--' : formatter(value);
  let trendDirection = trendDirectionProp;

  if (!trendDirection) {
    if (typeof change === 'number') {
      if (change === 0) {
        trendDirection = 'flat';
      } else {
        trendDirection = change > 0 ? 'up' : 'down';
      }
    } else if (typeof change === 'string') {
      const trimmed = change.trim();
      if (trimmed.startsWith('-')) {
        trendDirection = 'down';
      } else if (trimmed.startsWith('+')) {
        trendDirection = 'up';
      }
    }
  }

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
      accent={accent}
      trendDirection={trendDirection}
      className="min-h-[120px]"
    />
  );
};

export default StatsCard;
