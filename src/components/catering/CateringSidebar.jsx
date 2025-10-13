import React from 'react';
import {
  CalendarClock,
  ChevronRight,
  Clock,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { currency } from '@/features/analytics/common/utils';

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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-sky-50 text-slate-900 shadow-[0_34px_70px_-45px_rgba(15,23,42,0.3)] transition-all duration-300 ease-out dark:border-slate-800/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_64%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),_transparent_70%)]"
        />
        <div className="relative z-10 flex flex-col gap-6 p-6">
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-sky-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                Catering Menu
              </span>
              <p className="max-w-[16rem] text-sm text-muted-foreground dark:text-slate-300">
                Discover curated dishes and bundles ready for your next event.
              </p>
            </div>
            {hasMenuItems ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-200/60 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                Featured
              </span>
            ) : null}
          </header>

          <div className="space-y-4">
            {isMenuLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`menu-skeleton-${idx}`}
                    className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-200/80 bg-white/60 p-4 dark:border-slate-700/80 dark:bg-slate-900/40"
                  >
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-full" />
                      <Skeleton className="h-3 w-1/2 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasMenuItems ? (
              <div className="space-y-3">
                {menuItems.map((item) => {
                  const imageSrc = getItemImage(item);
                  const fallbackInitial =
                    (item?.name || '?').trim().charAt(0).toUpperCase() || '?';

                  return (
                    <div
                      key={item.id ?? item.name}
                      className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/75 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-sky-500/40"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item?.name || 'Menu item'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-600 dark:text-slate-200">
                            {fallbackInitial}
                          </div>
                        )}
                        <span className="absolute inset-0 rounded-xl border border-white/40 opacity-0 transition group-hover:opacity-100" />
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.name}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-slate-300/80">
                            {item.category || 'Uncategorized'}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-sky-700 dark:text-sky-300">
                          {currency(item.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-6 text-center text-sm text-muted-foreground dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300">
                No catering menu items available.
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-center gap-2 rounded-full border border-slate-200/70 bg-white/80 text-slate-900 transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-900'
            )}
            onClick={onViewFullMenu}
            disabled={isMenuLoading || !hasMenuItems}
          >
            View Full Menu <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-indigo-50 to-slate-100 text-slate-900 shadow-[0_34px_70px_-45px_rgba(79,70,229,0.35)] transition-all duration-300 ease-out dark:border-slate-800/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.28),_transparent_66%)] opacity-90"
        />
        <div className="relative z-10 flex flex-col gap-6 p-6">
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/60 bg-indigo-100/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200">
                <CalendarClock className="h-3.5 w-3.5" />
                Upcoming Events
              </span>
              <p className="max-w-[18rem] text-sm text-muted-foreground dark:text-slate-300">
                Stay aligned with celebrations on the horizon and prep your team
                in advance.
              </p>
            </div>
            {hasEvents ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200">
                {eventItems.length} scheduled
              </span>
            ) : null}
          </header>

          {hasEvents ? (
            <div className="relative space-y-5">
              <div
                className="absolute inset-y-2 left-3 w-0.5 rounded-full bg-gradient-to-b from-indigo-400/40 via-slate-300/40 to-transparent dark:from-indigo-400/40 dark:via-slate-700/40"
                aria-hidden="true"
              />
              {eventItems.map((event, index) => (
                <div
                  key={event.id ?? index}
                  className="relative ml-7 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-sky-500/40"
                >
                  <span className="absolute left-[-28px] top-5 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-300/60 bg-indigo-100/70 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-200">
                    <CalendarClock className="h-3 w-3" />
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground dark:text-slate-300/80">
                    <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                      {event.dateLabel || event.date || 'Date TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time || 'Time TBD'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {event.name}
                    </h4>
                    <p className="text-xs text-muted-foreground dark:text-slate-300/80">
                      {event.client || 'Client details not provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/70 p-6 text-center text-sm text-muted-foreground dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300">
              No upcoming events scheduled.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CateringSidebar;
