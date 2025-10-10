import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={heightClass}>{body}</CardContent>
    </Card>
  );
}
