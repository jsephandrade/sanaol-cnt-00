import React from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  muted:
    'border-border/60 bg-white/70 text-muted-foreground dark:bg-slate-900/50 dark:text-slate-300',
  error:
    'border-rose-500/40 bg-rose-50/70 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
};

export default function StateMessage({ message, variant = 'muted' }) {
  const styles = variantStyles[variant] ?? variantStyles.muted;

  return (
    <div className="flex h-full items-center justify-center px-3 py-4">
      <div
        className={cn(
          'flex min-h-[120px] w-full max-w-xs flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-5 text-sm font-medium backdrop-blur-sm transition-colors',
          styles
        )}
      >
        {message}
      </div>
    </div>
  );
}
