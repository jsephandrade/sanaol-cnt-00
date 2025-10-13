import * as React from 'react';
import { cn } from '@/lib/utils';

const THEMES = { light: '', dark: '.dark' };

const ChartContext = React.createContext({ config: {} });

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

const ChartContainer = React.forwardRef(
  (
    {
      id,
      className,
      children,
      config = {},
      role = 'img',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

    return (
      <ChartContext.Provider value={{ config, id: chartId }}>
        <div
          data-chart={chartId}
          ref={ref}
          role={role}
          aria-label={ariaLabel}
          className={cn(
            'relative flex h-full w-full flex-col justify-center text-xs',
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          {children}
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config || {}).filter(
    ([, value]) => value?.theme || value?.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltipContent = React.forwardRef(
  (
    {
      active = true,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || 'value'}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === 'string'
          ? config[label]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload?.fill || item.color;

            return (
              <div
                key={`${item.dataKey}-${index}`}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                            {
                              'h-2.5 w-2.5': indicator === 'dot',
                              'w-1': indicator === 'line',
                              'w-0 border-[1.5px] border-dashed bg-transparent':
                                indicator === 'dashed',
                              'my-0.5': nestLabel && indicator === 'dashed',
                            }
                          )}
                          style={{
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          }}
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center'
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value !== undefined && item.value !== null && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {typeof item.value === 'number'
                            ? item.value.toLocaleString()
                            : item.value}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegendContent = React.forwardRef(
  (
    { className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey },
    ref
  ) => {
    const { config } = useChart();

    const legendItems = React.useMemo(() => {
      if (payload?.length) return payload;

      return Object.keys(config || {}).map((key) => ({
        value: config[key]?.label || key,
        color: config[key]?.color,
        dataKey: key,
        payload: { fill: config[key]?.color },
      }));
    }, [payload, config]);

    if (!legendItems?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4 text-xs text-muted-foreground',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className
        )}
      >
        {legendItems.map((item) => {
          const key = `${nameKey || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={`${item.value}-${key}`}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor:
                      item.payload?.fill || item.color || itemConfig?.color,
                  }}
                />
              )}
              {itemConfig?.label || item.value}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = 'ChartLegendContent';

function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey = key;

  if (key in payload && typeof payload[key] === 'string') {
    configLabelKey = payload[key];
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key];
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
  useChart,
};
