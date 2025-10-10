import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const SHORT_DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const startOfMonth = (date) => {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
};

const shiftDateByMonths = (date, months) => {
  const base = date ? new Date(date) : startOfDay(new Date());
  const desiredDate = base.getDate();
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();
  target.setDate(Math.min(desiredDate, lastDay));
  return startOfDay(target);
};

const phpCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
  } catch {
    const n = Number(value ?? 0);
    return `PHP ${Number.isFinite(n) ? n.toFixed(2) : '0.00'}`;
  }
};

const getSafeDate = (iso) => {
  try {
    return parseISO(iso);
  } catch {
    return null;
  }
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'scheduled':
      return 'outline';
    case 'in-progress':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const CalendarViewModal = ({ open, onOpenChange, events = [] }) => {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [viewDate, setViewDate] = useState(startOfMonth(new Date()));

  const normalizedEventDates = useMemo(() => {
    const dates = events
      .map((event) => getSafeDate(event.date))
      .filter(Boolean)
      .map((date) => startOfDay(date).getTime());
    return Array.from(new Set(dates))
      .sort((a, b) => a - b)
      .map((time) => new Date(time));
  }, [events]);

  const hasEventsOnDate = (date) =>
    events.some((event) => {
      const parsed = getSafeDate(event.date);
      return parsed ? isSameDay(parsed, date) : false;
    });

  const getEventsForDate = (date) =>
    events.filter((event) => {
      const parsed = getSafeDate(event.date);
      return parsed ? isSameDay(parsed, date) : false;
    });

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const jumpToToday = () => {
    const today = startOfDay(new Date());
    setSelectedDate(today);
    setViewDate(startOfMonth(today));
  };

  const jumpToNextEventDay = () => {
    if (!normalizedEventDates.length) return;
    const anchor = startOfDay(selectedDate || new Date()).getTime();
    const next = normalizedEventDates.find((date) => date.getTime() > anchor);
    if (next) {
      setSelectedDate(next);
      setViewDate(startOfMonth(next));
    }
  };

  const jumpToPrevEventDay = () => {
    if (!normalizedEventDates.length) return;
    const anchor = startOfDay(selectedDate || new Date()).getTime();
    for (let i = normalizedEventDates.length - 1; i >= 0; i -= 1) {
      const current = normalizedEventDates[i];
      if (current.getTime() < anchor) {
        setSelectedDate(current);
        setViewDate(startOfMonth(current));
        break;
      }
    }
  };

  const nextEventDay = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return normalizedEventDates.find((date) => date.getTime() >= today) || null;
  }, [normalizedEventDates]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setViewDate(startOfMonth(selectedDate || new Date()));
  }, [open, selectedDate]);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }),
    []
  );
  const dayLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );
  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return '';
    return dayLabelFormatter.format(selectedDate);
  }, [selectedDate, dayLabelFormatter]);

  const currentMonthStart = viewDate
    ? startOfMonth(viewDate)
    : startOfMonth(new Date());
  const monthLabel = monthFormatter.format(currentMonthStart);

  const calendarDays = useMemo(() => {
    const monthStart = currentMonthStart;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const normalized = startOfDay(date);
      const isCurrentMonth = normalized.getMonth() === monthStart.getMonth();
      const isSelected =
        selectedDate && normalized.getTime() === selectedDate.getTime();
      const isToday = normalized.getTime() === startOfDay(new Date()).getTime();
      const isEventDay = hasEventsOnDate(normalized);

      return {
        date: normalized,
        key: normalized.toISOString(),
        isCurrentMonth,
        isSelected,
        isToday,
        isEventDay,
      };
    });
  }, [currentMonthStart, selectedDate, hasEventsOnDate]);

  const handleSelectDate = (date) => {
    if (!date) return;
    setSelectedDate(startOfDay(date));
  };

  const calendarStats = useMemo(() => {
    return {
      totalEvents: events.length,
      eventsForSelected: selectedDateEvents.length,
      nextEvent: nextEventDay
        ? format(nextEventDay, 'MMM dd, yyyy')
        : 'No upcoming events',
    };
  }, [events.length, nextEventDay, selectedDateEvents.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 p-0 pt-6 sm:max-w-6xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="text-xl font-semibold leading-tight">
            Catering Calendar Overview
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Track catering bookings, review details, and navigate quickly
            between event dates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Selected date
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedDateLabel || 'Pick a day'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToToday}
                  className="gap-1"
                >
                  Today
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">
                    Total events
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {calendarStats.totalEvents}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/80 p-3">
                  <p className="text-xs font-medium text-emerald-700">
                    Events this day
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {calendarStats.eventsForSelected}
                  </p>
                </div>
                <div className="rounded-lg border border-sky-200/70 bg-sky-50/80 p-3">
                  <p className="text-xs font-medium text-sky-700">Next event</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {calendarStats.nextEvent}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">
                Event Summary
              </h3>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <p>
                  Keep your catering commitments on track with a quick glance of
                  upcoming events and their statuses. Use the calendar to jump
                  to specific days and review guest counts, locations, and
                  financial details.
                </p>
                <p className="text-xs">
                  Tip: Use the arrow buttons beside the calendar to move month
                  to month, or jump directly between days that have scheduled
                  events.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <FeaturePanelCard
              badgeText="Shift Calendar"
              description="Browse the month and highlight dates with scheduled catering events."
              contentClassName="space-y-6"
            >
              <div className="rounded-lg border border-border/60 bg-background/70 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{monthLabel}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        setViewDate((prev) =>
                          shiftDateByMonths(prev || selectedDate, -1)
                        )
                      }
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        setViewDate((prev) =>
                          shiftDateByMonths(prev || selectedDate, 1)
                        )
                      }
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-tight text-muted-foreground">
                  {SHORT_DAY_LABELS.map((label) => (
                    <div key={label} className="py-1">
                      {label}
                    </div>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1 text-[12px]">
                  {calendarDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => handleSelectDate(day.date)}
                      className={[
                        'relative flex h-8 items-center justify-center rounded-md border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        day.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/60',
                        day.isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-muted',
                        day.isToday && !day.isSelected
                          ? 'border border-primary/60'
                          : '',
                      ].join(' ')}
                      aria-pressed={day.isSelected}
                      aria-label={dayLabelFormatter.format(day.date)}
                    >
                      {day.date.getDate()}
                      {day.isEventDay ? (
                        <span
                          className={[
                            'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                            day.isSelected
                              ? 'bg-primary-foreground'
                              : 'bg-primary',
                          ].join(' ')}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  Dots represent dates with scheduled catering events.
                </p>
              </div>
            </FeaturePanelCard>

            <FeaturePanelCard
              badgeText="Event Timeline"
              description={
                selectedDate
                  ? `Scheduled events for ${format(selectedDate, 'MMMM dd, yyyy')}`
                  : 'Select a date to view scheduled events.'
              }
              contentClassName="space-y-4"
            >
              <div className="relative max-h-96 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div
                  className="pointer-events-none absolute left-4 top-3 bottom-3 w-px bg-muted"
                  aria-hidden="true"
                />
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event, idx) => (
                    <div key={event.id ?? idx} className="relative pl-10">
                      <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary" />
                      <div className="group rounded-xl border border-transparent bg-slate-50/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white">
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-foreground">
                              {event.name || 'Untitled Event'}
                            </h4>
                            <p className="truncate text-xs text-muted-foreground">
                              {event.client || 'Client not specified'}
                            </p>
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(event.status)}
                            className="shrink-0 text-[10px] uppercase"
                          >
                            {(event.status || 'scheduled').replace('-', ' ')}
                          </Badge>
                        </div>

                        <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{event.time || 'Time TBD'}</span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="line-clamp-1">
                                {event.location}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {Number(event.attendees ?? 0)} attendees
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Contact
                            </span>
                            <span className="text-sm font-medium">
                              {event?.contactPerson?.name || '—'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {phpCurrency(event.total)}
                          </span>
                          <Button variant="outline" size="sm" className="gap-1">
                            View details
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : selectedDate ? (
                  <div className="py-10 text-center">
                    <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No events scheduled for this date.
                    </p>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <CalendarDays className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Select a date to view events.
                    </p>
                  </div>
                )}
              </div>
            </FeaturePanelCard>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Total events: {events.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToPrevEventDay}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={jumpToToday}>
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToNextEventDay}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
