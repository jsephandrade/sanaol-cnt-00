import React from 'react';

const variantClassNames = {
  muted: 'text-muted-foreground',
  error: 'text-destructive',
};

export default function StateMessage({ message, variant = 'muted' }) {
  const colorClass = variantClassNames[variant] ?? variantClassNames.muted;

  return (
    <div
      className={`flex h-full items-center justify-center text-sm ${colorClass}`}
    >
      {message}
    </div>
  );
}
