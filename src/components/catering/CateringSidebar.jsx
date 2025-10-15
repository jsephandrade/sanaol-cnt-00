import React, { useState } from 'react';
import {
  CalendarClock,
  ChevronRight,
  Clock,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value ?? 0);
  } catch {
    const fallback = Number(value ?? 0);
    const formatted = Number.isFinite(fallback) ? fallback.toFixed(2) : '0.00';
    return `PHP ${formatted}`;
  }
};

const getItemImage = (item) => {
  if (!item || typeof item !== 'object') return '';
  const imageKeys = ['image', 'imageUrl', 'image_url', 'photo', 'picture'];
  for (const key of imageKeys) {
    const value = item[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return '';
};

const safeSlice = (collection, count) =>
  Array.isArray(collection) ? collection.slice(0, count) : [];

export const CateringSidebar = ({
  cateringMenu = [],
  upcomingEvents = [],
  onViewFullMenu,
  isMenuLoading = false,
}) => {
  const menuItems = safeSlice(cateringMenu, 3);
  const eventItems = safeSlice(upcomingEvents, 4);
  const hasMenuItems = menuItems.length > 0;
  const hasEvents = eventItems.length > 0;
  const [showMenuView, setShowMenuView] = useState(false);
  const isShowingEvents = !showMenuView;

  const toggleView = () => setShowMenuView((prev) => !prev);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden rounded-md border border-border bg-white shadow-none ring-1 ring-border/60">
        {/* light theme decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-10 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-muted/40 blur-3xl" />

        <CardHeader className="relative pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xl font-semibold uppercase tracking-[0.2em] text-primary">
                {isShowingEvents ? (
                  <>
                    <CalendarClock className="h-3.5 w-3.5" />
                    Upcoming Events
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    Catering Menu
                  </>
                )}
              </div>
              {!isShowingEvents && (
                <CardDescription className="text-sm">
                  Discover curated dishes and bundles ready for your next event.
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleView}
                className="mt-1 inline-flex items-center justify-center"
                aria-pressed={showMenuView}
                aria-label={
                  isShowingEvents
                    ? 'Switch to catering menu'
                    : 'Switch to upcoming events'
                }
              >
                {isShowingEvents ? (
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                ) : (
                  <CalendarClock className="h-3.5 w-3.5" />
                )}
              </Button>
              {isShowingEvents && hasEvents && (
                <span className="inline-flex rounded-full bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {eventItems.length}
                </span>
              )}
              {!isShowingEvents && hasMenuItems && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured picks
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={`relative transition-opacity duration-300 ${showMenuView ? 'space-y-6' : ''}`}
        >
          {isShowingEvents ? (
            hasEvents ? (
              <div className="relative space-y-4">
                <div
                  className="absolute inset-y-2 left-3 w-px bg-muted"
                  aria-hidden="true"
                />
                {eventItems.map((event, index) => (
                  <div
                    key={event.id ?? index}
                    className="relative ml-7 rounded-2xl border border-transparent bg-muted/20 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background"
                  >
                    <span className="absolute left-[-28px] top-5 flex h-5 w-5 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                      <CalendarClock className="h-3 w-3" />
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        {event.dateLabel || event.date || 'Date TBD'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time || 'Time TBD'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <h4 className="text-base font-semibold text-foreground">
                        {event.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {event.client || 'Client details not provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-muted bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No upcoming events scheduled.
              </div>
            )
          ) : isMenuLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-muted bg-muted/20 p-3"
                >
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasMenuItems ? (
            <>
              <div className="space-y-3">
                {menuItems.map((item) => {
                  const imageSrc = getItemImage(item);
                  const fallbackInitial =
                    (item?.name || '?').trim().charAt(0).toUpperCase() || '?';

                  return (
                    <div
                      key={item.id ?? item.name}
                      className="group flex items-center gap-4 rounded-2xl border border-transparent bg-slate-50/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item?.name || 'Menu item'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-500">
                            {fallbackInitial}
                          </div>
                        )}
                        <span className="absolute inset-0 rounded-xl border border-white/50 opacity-0 transition group-hover:opacity-100" />
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {item.category || 'Uncategorized'}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onViewFullMenu}
                disabled={isMenuLoading || !hasMenuItems}
              >
                View Full Menu <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-muted bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No catering menu items available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CateringSidebar;
