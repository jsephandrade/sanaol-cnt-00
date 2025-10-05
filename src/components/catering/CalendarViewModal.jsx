import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  format,
  isSameDay,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';

/**
 * CalendarViewModal (Light Theme, UX Refined)
 * - Left: calendar with clear event-day highlights and quick month/year dropdown.
 * - Right: agenda-style timeline for the selected date (clean cards, subtle dividers).
 * - Header: short description and quick actions (Today, Next/Prev event day).
 * - Footer: total count + Close.
 */

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

export const CalendarViewModal = ({ open, onOpenChange, events = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Normalize event dates and keep a sorted unique set for quick navigation
  const normalizedEventDates = useMemo(() => {
    const dates = events
      .map((e) => getSafeDate(e.date))
      .filter(Boolean)
      .map((d) => startOfDay(d).getTime());

    return Array.from(new Set(dates))
      .sort((a, b) => a - b)
      .map((t) => new Date(t));
  }, [events]);

  const hasEventsOnDate = (date) =>
    events.some((event) => {
      const d = getSafeDate(event.date);
      return d ? isSameDay(d, date) : false;
    });

  const getEventsForDate = (date) =>
    events.filter((event) => {
      const d = getSafeDate(event.date);
      return d ? isSameDay(d, date) : false;
    });

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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

  const jumpToToday = () => setSelectedDate(new Date());

  // Next event day after selected
  const jumpToNextEventDay = () => {
    if (!normalizedEventDates.length) return;
    const anchor = startOfDay(selectedDate || new Date());
    const next = normalizedEventDates.find((d) => isAfter(d, anchor));
    if (next) setSelectedDate(next);
  };

  // Previous event day before selected
  const jumpToPrevEventDay = () => {
    if (!normalizedEventDates.length) return;
    const anchor = startOfDay(selectedDate || new Date());
    const prev = [...normalizedEventDates]
      .reverse()
      .find((d) => isBefore(d, anchor));
    if (prev) setSelectedDate(prev);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Light theme shell */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]">
          <div className="pointer-events-none absolute -right-16 -top-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-12 h-48 w-48 rounded-full bg-muted/40 blur-3xl" />

          <div className="relative p-6">
            <DialogHeader className="mb-2">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Catering Events Calendar
              </DialogTitle>
              <DialogDescription className="text-sm">
                Browse your schedule, spot busy days at a glance, and review
                details in the agenda. Use the dropdowns to jump months quickly,
                or hop to the next event day.
              </DialogDescription>
            </DialogHeader>

            {/* Quick actions */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={jumpToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={jumpToPrevEventDay}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev event day
              </Button>
              <Button variant="outline" size="sm" onClick={jumpToNextEventDay}>
                Next event day
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>

              <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-primary/20 ring-1 ring-primary/30" />
                  Has events
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-secondary/20 ring-1 ring-secondary/30" />
                  Today
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Calendar */}
              <Card className="relative overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Select a date</CardTitle>
                  <CardDescription>
                    Days with events are highlighted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full max-w-full rounded-md border p-3"
                    // DayPicker v9-friendly props:
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2035}
                    numberOfMonths={1}
                    hideNavigation
                    showOutsideDays
                    modifiers={{
                      hasEvents: (date) => hasEventsOnDate(date),
                      today: (date) => isSameDay(date, new Date()),
                    }}
                    modifiersClassNames={{
                      hasEvents:
                        'relative bg-primary/10 text-primary font-semibold ring-1 ring-primary/20',
                      today: 'ring-1 ring-secondary/40 text-foreground',
                    }}
                  />
                </CardContent>
              </Card>

              {/* Agenda / timeline for selected date */}
              <Card className="relative overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">
                      {selectedDate
                        ? `Agenda for ${format(selectedDate, 'MMMM d, yyyy')}`
                        : 'Select a date'}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    A concise, scannable overview of bookings and clients.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative max-h-96 space-y-4 overflow-y-auto">
                    {/* Timeline spine */}
                    <div
                      className="pointer-events-none absolute left-4 top-3 bottom-3 w-px bg-muted"
                      aria-hidden="true"
                    />
                    {selectedDateEvents.length > 0 ? (
                      selectedDateEvents.map((event, idx) => (
                        <div key={event.id ?? idx} className="relative pl-10">
                          {/* timeline node */}
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
                                {(event.status || 'scheduled').replace(
                                  '-',
                                  ' '
                                )}
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
                              {/* Wire this to your EventDetailsModal if desired */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
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
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Total events: {events.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={jumpToToday}>
                  Jump to today
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
