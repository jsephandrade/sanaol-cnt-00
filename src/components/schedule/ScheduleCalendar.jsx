import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

export const ScheduleCalendar = ({ getSchedulesForDay }) => {
  const [date, setDate] = useState(new Date());

  const selectedDayName = date?.toLocaleDateString('en-US', { weekday: 'long' });
  const schedulesForSelectedDay = selectedDayName ? getSchedulesForDay(selectedDayName) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar View</CardTitle>
        <CardDescription>Monthly schedule overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="border rounded-md"
        />

        {date && (
          <div>
            <h4 className="font-medium mb-2">
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <div className="space-y-2">
              {schedulesForSelectedDay.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <div>
                    <p className="font-medium">{entry.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.startTime} - {entry.endTime}
                    </p>
                  </div>
                  <Badge variant="outline">{entry.day}</Badge>
                </div>
              ))}

              {schedulesForSelectedDay.length === 0 && (
                <p className="text-sm text-muted-foreground">
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