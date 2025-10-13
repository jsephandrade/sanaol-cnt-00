import React from 'react';
import { ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';

export function AnalyticsTooltip(props) {
  return <ChartTooltipContent {...props} />;
}

export function AnalyticsLegend(props) {
  return <ChartLegendContent {...props} />;
}

export default {
  AnalyticsTooltip,
  AnalyticsLegend,
};
