import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const FeaturePanelCard = ({
  children,
  className,
  badgeText,
  badgeIcon: BadgeIcon,
  badgeClassName,
  title,
  description,
  headerActions,
  headerContent,
  headerClassName,
  contentClassName,
  disableDecor = false,
}) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-md border border-border bg-card shadow-none ring-1 ring-border/60',
        className
      )}
    >
      {!disableDecor ? (
        <>
          <div className="pointer-events-none absolute -right-16 -top-10 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-muted/40 blur-3xl" />
        </>
      ) : null}

      <CardHeader className={cn('relative pb-2', headerClassName)}>
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 md:flex-1 md:min-w-0">
            {badgeText ? (
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-base font-semibold uppercase tracking-[0.25em] text-primary md:text-lg',
                  badgeClassName
                )}
              >
                {BadgeIcon ? (
                  <BadgeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : null}
                <span>{badgeText}</span>
              </div>
            ) : null}
            {title ? (
              <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            ) : null}
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {headerActions || headerContent ? (
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-shrink-0 md:items-end">
              {headerActions ? (
                <div className="flex w-full justify-start md:w-auto md:justify-end">
                  {headerActions}
                </div>
              ) : null}
              {headerContent ? (
                <div className="w-full md:w-auto">{headerContent}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn('relative space-y-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

export default FeaturePanelCard;
