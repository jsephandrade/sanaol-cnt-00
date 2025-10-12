import React, { Suspense } from 'react';

const LazyResponsiveLine = React.lazy(() =>
  import('@nivo/line').then((module) => ({ default: module.ResponsiveLine }))
);

const LazyResponsiveBar = React.lazy(() =>
  import('@nivo/bar').then((module) => ({ default: module.ResponsiveBar }))
);

const LazyResponsivePie = React.lazy(() =>
  import('@nivo/pie').then((module) => ({ default: module.ResponsivePie }))
);

function ChartFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center text-xs text-muted-foreground"
      role="presentation"
      aria-hidden="true"
    >
      Loading chart…
    </div>
  );
}

export function ResponsiveLine(props) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <LazyResponsiveLine {...props} />
    </Suspense>
  );
}

export function ResponsiveBar(props) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <LazyResponsiveBar {...props} />
    </Suspense>
  );
}

export function ResponsivePie(props) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <LazyResponsivePie {...props} />
    </Suspense>
  );
}

export default {
  ResponsiveLine,
  ResponsiveBar,
  ResponsivePie,
};
