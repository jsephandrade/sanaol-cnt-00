import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

const CalendarViewCard = ({ date, setDate, schedule }) => {
  return (
    <Card className="sm:text-sm">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Calendar</CardTitle>
        <CardDescription className="text-xs">Monthly overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border p-2 w-full max-w-full"
          classNames={{
            caption_label: 'text-xs font-medium',
            nav_button: 'h-6 w-6',
            head_cell: 'text-[10px] w-7',
            row: 'flex w-full mt-1',
            cell: 'h-7 w-7',
            day: 'h-7 w-7 p-0 text-xs',
          }}
        />

        {date && (
          <div>
            <h4 className="font-medium mb-1 text-sm">
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <div className="space-y-1.5">
              {schedule
                .filter(
                  (entry) =>
                    entry.day ===
                    date.toLocaleDateString('en-US', { weekday: 'long' })
                )
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-1.5 bg-muted/70 rounded"
                  >
                    <div>
                      <p className="font-medium text-xs">
                        {entry.employeeName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.startTime} - {entry.endTime}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] py-0 px-1">
                      {entry.day}
                    </Badge>
                  </div>
                ))}

              {schedule.filter(
                (entry) =>
                  entry.day ===
                  date.toLocaleDateString('en-US', { weekday: 'long' })
              ).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No schedules for this day
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarViewCard;
