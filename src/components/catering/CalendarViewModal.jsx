import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Users, MapPin, X } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

export const CalendarViewModal = ({ open, onOpenChange, events }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getEventsForDate = (date) => {
    return events.filter((event) => isSameDay(parseISO(event.date), date));
  };

  const hasEventsOnDate = (date) => {
    return events.some((event) => isSameDay(parseISO(event.date), date));
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Catering Events Calendar</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select a Date</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-3 pointer-events-auto"
              modifiers={{
                hasEvents: (date) => hasEventsOnDate(date),
              }}
              modifiersClassNames={{
                hasEvents: 'bg-primary/10 text-primary font-semibold',
              }}
            />
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/10 border border-primary/20"></div>
                <span>Days with events</span>
              </div>
            </div>
          </div>

          {/* Events for Selected Date */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <h3 className="font-semibold">
                {selectedDate
                  ? `Events on ${format(selectedDate, 'MMMM d, yyyy')}`
                  : 'Select a date to view events'}
              </h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {event.name}
                        </CardTitle>
                        <Badge
                          variant={getStatusBadgeVariant(event.status)}
                          className="text-xs"
                        >
                          {event.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.client}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.attendees} attendees</span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold">
                          ${event.total.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Contact: {event.contactPerson.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No events scheduled for this date
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Select a date to view events
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Total Events: {events.length}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
