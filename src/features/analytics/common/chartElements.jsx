import React from 'react';
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { gridStyle } from './chartTheme';

export function AnalyticsTooltip({
  valueFormatter,
  labelFormatter,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  ...rest
}) {
  return (
    <ChartTooltip
      cursor={{ stroke: gridStyle.stroke }}
      content={(props) => (
        <ChartTooltipContent
          {...props}
          formatter={valueFormatter || props.formatter}
          labelFormatter={labelFormatter || props.labelFormatter}
          indicator={indicator}
          hideLabel={hideLabel}
          hideIndicator={hideIndicator}
          {...rest}
        />
      )}
    />
  );
}

export function AnalyticsLegend({
  align = 'center',
  verticalAlign = 'bottom',
  ...rest
}) {
  return (
    <ChartLegend
      align={align}
      verticalAlign={verticalAlign}
      content={(props) => <ChartLegendContent {...props} {...rest} />}
    />
  );
}

export default {
  AnalyticsTooltip,
  AnalyticsLegend,
};
