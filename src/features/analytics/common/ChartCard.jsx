import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import StateMessage from './StateMessage';

export default function ChartCard({
  title,
  description,
  loading,
  error,
  data,
  emptyMessage = 'No data available.',
  heightClass = 'h-64',
  children,
  className = '',
}) {
  let body = children;

  if (loading) {
    body = <StateMessage message="Loading..." variant="muted" />;
  } else if (error) {
    body = <StateMessage message={error} variant="error" />;
  } else if (!data || data.length === 0) {
    body = <StateMessage message={emptyMessage} variant="muted" />;
  }

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 text-slate-900 shadow-[0_34px_70px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_38px_80px_-44px_rgba(15,23,42,0.38)] dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent dark:via-indigo-400/50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_65%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_70%)]"
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <CardHeader className="flex flex-col gap-2 p-6 pb-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-sm text-muted-foreground/80">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex-1 p-6 pt-0">
          <div
            className={cn(
              'w-full rounded-2xl bg-white/60 p-3 shadow-inner dark:bg-slate-900/40',
              heightClass
            )}
          >
            {body}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
