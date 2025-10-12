import React, { useId, useMemo } from 'react';
import { ResponsiveLine } from '@/components/charts';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import {
  axisTickStyle,
  getFillColor,
  getSeriesColor,
  gridStyle,
} from './chartTheme';
import { AnalyticsLegend, AnalyticsTooltip } from './chartElements';
import { toFiniteNumber, computeDomain } from './BarCategory';

const defaultSeries = [
  { key: 'value', label: 'Value', type: 'area', variant: 'primary' },
];

const defaultAxes = [{ id: 'main', orientation: 'left' }];

const defaultValueFormatter = (value) =>
  typeof value === 'number'
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

const CURVE_MAP = {
  monotone: 'monotoneX',
  linear: 'linear',
  step: 'step',
};

const normaliseDomain = (domain) => {
  if (!Array.isArray(domain) || domain.length !== 2) {
    return [0, 1];
  }

  let [min, max] = domain.map((value) =>
    Number.isFinite(value) ? value : Number(value)
  );

  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = min === 0 ? 1 : min * 1.1;

  if (min === max) {
    if (min === 0) {
      max = 1;
    } else if (min > 0) {
      max = min * 1.1;
      min = 0;
    } else {
      min = min * 1.1;
      max = 0;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [0, 1];
  }

  return [Math.min(min, max), Math.max(min, max)];
};

const parseGradientOffset = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
      const numeric = Number.parseFloat(trimmed.slice(0, -1));
      if (Number.isFinite(numeric)) {
        return numeric / 100;
      }
    }
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return 0;
};

export default function TimeSeries({
  data = [],
  series = defaultSeries,
  xKey = 't',
  xTickFormatter,
  xTicks,
  xAxisProps = {},
  yAxes = defaultAxes,
  legend = false,
  legendProps = {},
  tooltipFormatter = defaultValueFormatter,
  tooltipLabelFormatter,
  tooltipProps = {},
  showGrid = true,
  margin = { top: 16, right: 24, left: 12, bottom: 12 },
  className = '',
}) {
  const resolvedAxes = yAxes.length ? yAxes : defaultAxes;
  const defaultAxisId = resolvedAxes[0]?.id ?? 'main';
  const chartDomId = useId().replace(/:/g, '');

  const axisMap = useMemo(() => {
    const map = new Map();
    resolvedAxes.forEach((axis) => {
      const axisId = axis.id || axis.orientation || defaultAxisId;
      map.set(axisId, axis);
    });
    if (!map.has(defaultAxisId)) {
      map.set(defaultAxisId, { id: defaultAxisId, orientation: 'left' });
    }
    return map;
  }, [resolvedAxes, defaultAxisId]);

  const baseAxis = useMemo(() => {
    return (
      resolvedAxes.find((axis) => (axis.orientation ?? 'left') === 'left') ||
      resolvedAxes[0] || { id: defaultAxisId }
    );
  }, [resolvedAxes, defaultAxisId]);

  const baseAxisId = baseAxis?.id || baseAxis?.orientation || defaultAxisId;

  const seriesDefs = useMemo(
    () =>
      (Array.isArray(series) && series.length ? series : defaultSeries)
        .map((item, index) => {
          if (!item) return null;
          const key = item.key || item.dataKey;
          if (!key) return null;
          const variantToken = item.variant || `chart-${(index % 6) + 1}`;
          const color = item.color || getSeriesColor(index, variantToken);
          const type = item.type || 'line';

          return {
            key,
            label: item.label || String(key),
            type,
            color,
            variant: variantToken,
            curve: item.curve || 'linear',
            strokeWidth: item.strokeWidth ?? 2,
            strokeOpacity: item.strokeOpacity ?? 1,
            dot: item.dot,
            activeDot: item.activeDot,
            yAxisId: item.yAxisId || defaultAxisId,
            gradientStops: item.gradientStops,
            fill: item.fill,
            radius: item.radius,
            stackId: item.stackId,
          };
        })
        .filter(Boolean),
    [series, defaultAxisId]
  );

  const lineSeriesDefs = useMemo(
    () => seriesDefs.filter((serie) => serie.type !== 'bar'),
    [seriesDefs]
  );
  const barSeriesDefs = useMemo(
    () => seriesDefs.filter((serie) => serie.type === 'bar'),
    [seriesDefs]
  );

  const seriesConfig = useMemo(
    () =>
      seriesDefs.reduce((acc, item) => {
        acc[item.key] = { label: item.label, color: item.color };
        return acc;
      }, {}),
    [seriesDefs]
  );

  const valuesByAxis = useMemo(() => {
    const map = new Map();
    seriesDefs.forEach((serie) => {
      const axisId = serie.yAxisId || defaultAxisId;
      if (!map.has(axisId)) {
        map.set(axisId, []);
      }
      const target = map.get(axisId);
      (Array.isArray(data) ? data : []).forEach((datum) => {
        const rawValue = datum?.[serie.key];
        target.push(toFiniteNumber(rawValue, 0));
      });
    });
    if (!map.has(defaultAxisId)) {
      map.set(defaultAxisId, []);
    }
    return map;
  }, [seriesDefs, data, defaultAxisId]);

  const domainByAxis = useMemo(() => {
    const map = new Map();
    axisMap.forEach((axis, axisId) => {
      if (Array.isArray(axis.domain) && axis.domain.length === 2) {
        map.set(axisId, normaliseDomain(axis.domain));
      } else {
        const values = valuesByAxis.get(axisId) || [];
        map.set(axisId, normaliseDomain(computeDomain(values)));
      }
    });
    if (!map.has(defaultAxisId)) {
      const fallbackValues = valuesByAxis.get(defaultAxisId) || [];
      map.set(defaultAxisId, normaliseDomain(computeDomain(fallbackValues)));
    }
    return map;
  }, [axisMap, valuesByAxis, defaultAxisId]);

  const scaleInfo = useMemo(() => {
    const baseDomain = domainByAxis.get(baseAxisId) || [0, 1];
    const safeBaseDomain = normaliseDomain(baseDomain);
    const [baseMin, baseMax] = safeBaseDomain;
    const baseSpan = baseMax - baseMin || 1;

    const map = new Map();

    domainByAxis.forEach((domain, axisId) => {
      const safeDomain = normaliseDomain(domain);
      if (axisId === baseAxisId) {
        map.set(axisId, {
          domain: safeDomain,
          project: (value) => (Number.isFinite(value) ? value : baseMin),
          invert: (value) => (Number.isFinite(value) ? value : baseMin),
        });
        return;
      }

      const [domainMin, domainMax] = safeDomain;
      const span = domainMax - domainMin || 1;

      map.set(axisId, {
        domain: safeDomain,
        project: (value) => {
          if (!Number.isFinite(value)) return baseMin;
          if (span === 0) return baseMin;
          return baseMin + ((value - domainMin) / span) * baseSpan;
        },
        invert: (value) => {
          if (!Number.isFinite(value)) return domainMin;
          return domainMin + ((value - baseMin) / baseSpan) * span;
        },
      });
    });

    if (!map.has(baseAxisId)) {
      map.set(baseAxisId, {
        domain: safeBaseDomain,
        project: (value) => (Number.isFinite(value) ? value : baseMin),
        invert: (value) => (Number.isFinite(value) ? value : baseMin),
      });
    }

    return {
      baseDomain: safeBaseDomain,
      map,
      baseMin,
      baseMax,
    };
  }, [domainByAxis, baseAxisId]);

  const xValues = useMemo(
    () => (Array.isArray(data) ? data.map((item) => item?.[xKey]) : []),
    [data, xKey]
  );

  const seriesMeta = useMemo(() => {
    const map = new Map();
    seriesDefs.forEach((serie) => {
      map.set(serie.key, serie);
    });
    return map;
  }, [seriesDefs]);

  const chartSeries = useMemo(() => {
    const lineData = lineSeriesDefs.map((serie) => {
      const axisId = serie.yAxisId || defaultAxisId;
      const scaler =
        scaleInfo.map.get(axisId) ||
        scaleInfo.map.get(baseAxisId) ||
        scaleInfo.map.get(defaultAxisId);

      const serieData = (Array.isArray(data) ? data : []).map((datum) => {
        const xValue = datum?.[xKey];
        const rawValue = datum?.[serie.key];
        const numericValue = toFiniteNumber(rawValue, 0);
        const projected = scaler.project(numericValue);

        return {
          x: xValue,
          y: projected,
          originalValue: numericValue,
          rawValue,
          payload: datum,
          color: serie.color,
          axisId,
          serieKey: serie.key,
          serieLabel: serie.label,
        };
      });

      return {
        id: serie.key,
        color: serie.color,
        data: serieData,
      };
    });

    const barValues = new Map();
    (Array.isArray(data) ? data : []).forEach((datum) => {
      const xValue = datum?.[xKey];
      if (xValue === undefined || xValue === null) return;
      const entries = barSeriesDefs.map((serie) => {
        const axisId = serie.yAxisId || defaultAxisId;
        const scaler =
          scaleInfo.map.get(axisId) ||
          scaleInfo.map.get(baseAxisId) ||
          scaleInfo.map.get(defaultAxisId);
        const rawValue = datum?.[serie.key];
        const numericValue = toFiniteNumber(rawValue, 0);

        return {
          serieKey: serie.key,
          serieLabel: serie.label,
          value: numericValue,
          color: serie.color,
          projected: scaler.project(numericValue),
          zero: scaler.project(0),
          axisId,
          payload: datum,
          radius: Array.isArray(serie.radius) ? serie.radius[0] : serie.radius,
          variant: serie.variant,
        };
      });
      barValues.set(xValue, entries);
    });

    return { lineData, barValues };
  }, [
    lineSeriesDefs,
    barSeriesDefs,
    data,
    xKey,
    scaleInfo,
    baseAxisId,
    defaultAxisId,
  ]);

  const gradientConfig = useMemo(() => {
    const defs = [];
    const fill = [];

    lineSeriesDefs.forEach((serie, index) => {
      if (serie.type !== 'area') return;
      const gradientId = `${chartDomId}-area-${index}`;
      const stops =
        Array.isArray(serie.gradientStops) && serie.gradientStops.length
          ? serie.gradientStops
          : [
              { offset: '0%', stopColor: serie.color, stopOpacity: 0.45 },
              { offset: '55%', stopColor: serie.color, stopOpacity: 0.25 },
              { offset: '100%', stopColor: serie.color, stopOpacity: 0 },
            ];

      defs.push({
        id: gradientId,
        type: 'linearGradient',
        colors: stops.map((stop) => ({
          offset: parseGradientOffset(stop.offset ?? 0),
          color: stop.stopColor || serie.color,
          opacity:
            stop.stopOpacity !== undefined
              ? stop.stopOpacity
              : 0.4,
        })),
      });
      fill.push({ match: { id: serie.key }, id: gradientId });
    });

    return { defs, fill };
  }, [lineSeriesDefs, chartDomId]);

  const computedCurve = useMemo(() => {
    if (!lineSeriesDefs.length) return 'linear';
    const preferred = lineSeriesDefs.find((serie) => serie.curve === 'monotone');
    if (preferred) return CURVE_MAP.monotone;
    const step = lineSeriesDefs.find((serie) => serie.curve === 'step');
    if (step) return CURVE_MAP.step;
    const explicit = lineSeriesDefs.find((serie) => CURVE_MAP[serie.curve]);
    if (explicit) return CURVE_MAP[explicit.curve];
    return CURVE_MAP.linear;
  }, [lineSeriesDefs]);

  const enablePoints = useMemo(
    () => lineSeriesDefs.some((serie) => serie.dot !== false),
    [lineSeriesDefs]
  );

  const areaEnabled = useMemo(
    () => lineSeriesDefs.some((serie) => serie.type === 'area'),
    [lineSeriesDefs]
  );

  const axisBottomConfig = useMemo(() => {
    const {
      tick: providedTick = {},
      tickMargin = 12,
      angle = 0,
      height,
      ticks: providedTicks,
      ...rest
    } = xAxisProps || {};

    const tickValues = Array.isArray(xTicks) && xTicks.length ? xTicks : providedTicks;

    return {
      tickSize: 0,
      tickPadding: tickMargin,
      tickRotation: providedTick?.angle ?? angle ?? 0,
      format: (value) =>
        typeof xTickFormatter === 'function'
          ? xTickFormatter(value)
          : value,
      legendOffset: height,
      ...axisTickStyle,
      ...rest,
      tickValues,
    };
  }, [xAxisProps, xTicks, xTickFormatter]);

  const leftAxisConfig = useMemo(() => {
    const leftAxis = Array.from(axisMap.values()).find(
      (axis) => (axis.orientation ?? 'left') === 'left'
    );
    if (!leftAxis) return null;
    const axisId = leftAxis.id || leftAxis.orientation || defaultAxisId;
    const scaler =
      scaleInfo.map.get(axisId) ||
      scaleInfo.map.get(baseAxisId) ||
      scaleInfo.map.get(defaultAxisId);

    return {
      tickSize: 0,
      tickPadding: leftAxis.tickMargin ?? 8,
      tickRotation: 0,
      format: (value) => {
        const actual = scaler.invert(value);
        return leftAxis.tickFormatter
          ? leftAxis.tickFormatter(actual)
          : defaultValueFormatter(actual);
      },
      ...axisTickStyle,
    };
  }, [axisMap, scaleInfo, baseAxisId, defaultAxisId]);

  const rightAxisConfig = useMemo(() => {
    const rightAxis = Array.from(axisMap.values()).find(
      (axis) => axis.orientation === 'right'
    );
    if (!rightAxis) return null;
    const axisId = rightAxis.id || 'right';
    const scaler =
      scaleInfo.map.get(axisId) ||
      scaleInfo.map.get(baseAxisId) ||
      scaleInfo.map.get(defaultAxisId);

    return {
      tickSize: 0,
      tickPadding: rightAxis.tickMargin ?? 8,
      tickRotation: 0,
      format: (value) => {
        const actual = scaler.invert(value);
        return rightAxis.tickFormatter
          ? rightAxis.tickFormatter(actual)
          : defaultValueFormatter(actual);
      },
      ...axisTickStyle,
    };
  }, [axisMap, scaleInfo, baseAxisId, defaultAxisId]);

  const legendPayload = useMemo(
    () =>
      seriesDefs.map((serie) => ({
        dataKey: serie.key,
        value: serie.label,
        color: serie.color,
        payload: { fill: serie.color },
      })),
    [seriesDefs]
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

  const sliceTooltip = ({ slice }) => {
    if (!slice?.points?.length) return null;
    const indexValue = slice.points[0]?.data?.x;
    const barsForIndex = chartSeries.barValues.get(indexValue) || [];

    const payloadItems = [];

    slice.points.forEach((point) => {
      const serieMeta = seriesMeta.get(point.serieId);
      if (!serieMeta) return;
      payloadItems.push({
        dataKey: point.serieId,
        name: serieMeta.label,
        value: point.data.originalValue,
        color: serieMeta.color,
        payload: {
          ...point.data.payload,
          fill: serieMeta.color,
        },
      });
    });

    barsForIndex.forEach((bar) => {
      payloadItems.push({
        dataKey: bar.serieKey,
        name: bar.serieLabel,
        value: bar.value,
        color: bar.color,
        payload: {
          ...bar.payload,
          fill: bar.color,
        },
      });
    });

    const label =
      typeof tooltipLabelFormatter === 'function'
        ? tooltipLabelFormatter(indexValue, slice.points[0]?.data?.payload)
        : indexValue;

    return (
      <AnalyticsTooltip
        active
        {...tooltipProps}
        payload={payloadItems}
        label={label}
        formatter={resolvedTooltipFormatter}
      />
    );
  };

  const barLayer = useMemo(() => {
    if (!barSeriesDefs.length) {
      return () => null;
    }

    return ({ xScale, yScale, innerWidth }) => {
      if (!xScale || !yScale) return null;

      const step =
        xValues.length > 1
          ? Math.abs(xScale(xValues[1]) - xScale(xValues[0])) || innerWidth / xValues.length
          : innerWidth / Math.max(xValues.length, 1);

      const groupWidth = Number.isFinite(step) ? step * 0.6 : 24;
      const singleWidth = groupWidth / Math.max(barSeriesDefs.length, 1);

      return (
        <g>
          {xValues.map((xValue) => {
            const bars = chartSeries.barValues.get(xValue) || [];
            if (!bars.length) return null;
            const xPos = xScale(xValue);
            if (!Number.isFinite(xPos)) return null;

            return bars.map((bar, index) => {
              const projected = bar.projected;
              const zeroProjected = bar.zero;
              if (!Number.isFinite(projected) || !Number.isFinite(zeroProjected)) {
                return null;
              }
              const y = yScale(projected);
              const zeroY = yScale(zeroProjected);
              if (!Number.isFinite(y) || !Number.isFinite(zeroY)) {
                return null;
              }
              const height = zeroY - y;
              const finalY = height >= 0 ? y : zeroY;
              const finalHeight = Math.abs(height);
              const offset =
                xPos - groupWidth / 2 + index * singleWidth + singleWidth * 0.1;

              return (
                <rect
                  key={`${bar.serieKey}-${xValue}`}
                  x={offset}
                  width={Math.max(singleWidth * 0.8, 1)}
                  y={finalY}
                  height={Math.max(finalHeight, 0)}
                  fill={bar.color || getFillColor(bar.variant)}
                  opacity={0.9}
                  rx={bar.radius ?? 4}
                />
              );
            });
          })}
        </g>
      );
    };
  }, [barSeriesDefs.length, chartSeries.barValues, xValues]);

  return (
    <ChartContainer
      className={cn('h-full w-full aspect-auto', className)}
      config={seriesConfig}
    >
      {legend ? <AnalyticsLegend payload={legendPayload} {...legendProps} /> : null}
      <div className="h-full w-full" role="presentation">
        <ResponsiveLine
          data={chartSeries.lineData}
          margin={margin}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: scaleInfo.baseDomain[0],
            max: scaleInfo.baseDomain[1],
          }}
          curve={computedCurve}
          enableArea={areaEnabled}
          areaOpacity={1}
          colors={(serie) => seriesMeta.get(serie.id)?.color || serie.color}
          lineWidth={(serie) =>
            seriesMeta.get(serie.id)?.strokeWidth ?? serie?.strokeWidth ?? 2
          }
          enablePoints={enablePoints}
          pointSize={(point) => {
            const serie = seriesMeta.get(point.serieId);
            if (!serie) return 0;
            if (serie.dot === false) return 0;
            if (typeof serie.dot === 'object' && Number.isFinite(serie.dot?.r)) {
              return Math.max(serie.dot.r * 2, 2);
            }
            return 6;
          }}
          pointColor={(point) =>
            point.data.color || seriesMeta.get(point.serieId)?.color
          }
          pointBorderWidth={1}
          pointBorderColor={(point) =>
            point.data.color || seriesMeta.get(point.serieId)?.color
          }
          enableGridX={false}
          enableGridY={showGrid}
          axisBottom={axisBottomConfig}
          axisLeft={leftAxisConfig}
          axisRight={rightAxisConfig}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: axisTickStyle?.fill,
                  fontSize: axisTickStyle?.fontSize,
                },
              },
            },
            grid: {
              line: {
                stroke: gridStyle.stroke,
                strokeDasharray: gridStyle.strokeDasharray,
              },
            },
            tooltip: {
              container: {
                background: 'transparent',
              },
            },
          }}
          enableSlices="x"
          useMesh
          sliceTooltip={sliceTooltip}
          defs={gradientConfig.defs}
          fill={gradientConfig.fill}
          layers={[
            'grid',
            'markers',
            barLayer,
            'areas',
            'lines',
            'points',
            'slices',
            'mesh',
          ]}
          role="img"
          ariaLabel="Time series chart"
        />
      </div>
    </ChartContainer>
  );
}
