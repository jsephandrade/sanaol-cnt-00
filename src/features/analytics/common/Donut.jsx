import React, { useMemo } from 'react';
import { ResponsivePie } from '@/components/charts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { getSeriesColor } from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';

const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

export default function Donut({
  data = [],
  valueKey = 'value',
  nameKey = 'name',
  label,
  legend = true,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  innerRadius = 48,
  outerRadius = 80,
  padAngle = 2,
  className = '',
}) {
  const palette = useMemo(
    () =>
      data.map((_, index) => ({
        color: getSeriesColor(index),
      })),
    [data]
  );

  const config = useMemo(() => {
    if (!data.length) {
      return {
        [valueKey]: {
          label: label || valueKey,
          color: palette[0]?.color || getSeriesColor(0),
        },
      };
    }

    return data.reduce((acc, entry, index) => {
      const rawLabel = entry?.[nameKey];
      const sliceLabel =
        typeof rawLabel === 'string' && rawLabel.trim().length
          ? rawLabel
          : `${label || nameKey || 'Slice'} ${index + 1}`;
      const sliceColor =
        entry?.color ||
        palette[index % palette.length]?.color ||
        palette[0]?.color ||
        getSeriesColor(index);

      acc[sliceLabel] = {
        label: sliceLabel,
        color: sliceColor,
      };

      return acc;
    }, {});
  }, [data, label, nameKey, palette, valueKey]);

  const totalValue = useMemo(
    () =>
      (Array.isArray(data) ? data : []).reduce(
        (sum, entry) => sum + Number(entry?.[valueKey] || 0),
        0
      ),
    [data, valueKey]
  );

  const legendPayload = useMemo(
    () =>
      data.map((entry, index) => {
        const sliceLabel =
          typeof entry?.[nameKey] === 'string' && entry[nameKey]
            ? entry[nameKey]
            : `${label || nameKey || 'Slice'} ${index + 1}`;
        const color =
          entry?.color ||
          palette[index % palette.length]?.color ||
          palette[0]?.color ||
          getSeriesColor(index);
        return {
          dataKey: sliceLabel,
          value: sliceLabel,
          color,
          payload: { fill: color },
        };
      }),
    [data, nameKey, label, palette]
  );

  const resolvedTooltipFormatter = useMemo(() => {
    if (typeof tooltipProps?.formatter === 'function') {
      return tooltipProps.formatter;
    }
    if (typeof tooltipFormatter === 'function') {
      return (value, name, item, index, payload) =>
        tooltipFormatter(value, name, payload || item?.payload, index);
    }
    return undefined;
  }, [tooltipProps, tooltipFormatter]);

  const renderTooltip = ({ datum }) => {
    if (!datum) return null;
    const sliceLabel = datum.data?.[nameKey] ?? datum.label;
    const percentage = totalValue ? (datum.value / totalValue) * 100 : 0;

    const payloadEntry = {
      dataKey: sliceLabel,
      name: sliceLabel,
      value: datum.value,
      color: datum.color,
      payload: {
        ...datum.data,
        percentage,
        fill: datum.color,
      },
    };

    const tooltipLabel =
      typeof tooltipLabelFormatter === 'function'
        ? tooltipLabelFormatter(sliceLabel, datum.data)
        : sliceLabel;

    return (
      <AnalyticsTooltip
        active
        {...tooltipProps}
        payload={[payloadEntry]}
        label={tooltipLabel}
        formatter={resolvedTooltipFormatter}
      />
    );
  };

  const resolvedInnerRadius = useMemo(() => {
    if (!Number.isFinite(innerRadius) || innerRadius <= 0) {
      return 0.45;
    }
    if (innerRadius <= 1) {
      return innerRadius;
    }
    const denominator = Number.isFinite(outerRadius) && outerRadius > 0 ? outerRadius : innerRadius * 1.6;
    const ratio = innerRadius / denominator;
    return Math.min(Math.max(ratio, 0), 0.92);
  }, [innerRadius, outerRadius]);

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-square', className)}
      config={config}
    >
      <div className="h-full w-full">
        <ResponsivePie
          data={data.map((entry, index) => ({
            id:
              typeof entry?.[nameKey] === 'string' && entry[nameKey]
                ? entry[nameKey]
                : `${label || nameKey || 'Slice'} ${index + 1}`,
            label:
              typeof entry?.[nameKey] === 'string' && entry[nameKey]
                ? entry[nameKey]
                : `${label || nameKey || 'Slice'} ${index + 1}`,
            value: entry?.[valueKey] ?? 0,
            color:
              entry?.color ||
              palette[index % palette.length]?.color ||
              palette[0]?.color ||
              getSeriesColor(index),
            data: entry,
          }))}
          margin={{ top: 16, right: 16, bottom: legend ? 48 : 16, left: 16 }}
          innerRadius={resolvedInnerRadius}
          padAngle={padAngle}
          cornerRadius={4}
          activeOuterRadiusOffset={8}
          colors={(datum) => datum.data.color || datum.color}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          tooltip={renderTooltip}
          role="img"
          ariaLabel={label ? `${label} donut chart` : 'Donut chart'}
        />
      </div>
      {legend ? (
        <AnalyticsLegend
          className="pt-4"
          payload={legendPayload}
          {...legendProps}
        />
      ) : null}
    </ChartContainer>
  );
}
