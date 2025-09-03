import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * StaffSummary
 *
 * Renders a summary of employees with their weekly scheduled hours
 * and hourly rate. Expects `employees` and `schedule` props.
 */
const StaffSummary = ({ employees = [], schedule = [] }) => {
  const calculateWeeklyHours = (employeeId) => {
    const employeeSchedule = schedule.filter(
      (entry) => entry.employeeId === employeeId
    );
    return employeeSchedule.reduce((total, entry) => {
      const start = new Date(`1970-01-01T${entry.startTime}`);
      const end = new Date(`1970-01-01T${entry.endTime}`);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + diffHours;
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Summary</CardTitle>
        <CardDescription>Employee overview and weekly hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.map((employee) => {
            const weeklyHours = calculateWeeklyHours(employee.id);
            return (
              <div
                key={employee.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {employee.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium leading-none">{employee.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {employee.position}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right gap-1">
                  <Badge variant="outline" className="py-0.5 px-2 text-xs">
                    {weeklyHours.toFixed(1)}h/week
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ₱{employee.hourlyRate}
                    <span className="font-light">/hr</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffSummary;

