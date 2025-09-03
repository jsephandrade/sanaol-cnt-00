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
 * This component renders a summary of all employees along with the
 * total hours they are scheduled to work in a week and their hourly
 * rate. It accepts an `employees` array and a `schedule` array as
 * props. Each employee object should have at least `id`, `name`,
 * `position` and `hourlyRate` fields. Each schedule entry should
 * contain `employeeId`, `startTime` and `endTime` fields. The
 * component will calculate the total weekly hours for each employee
 * by summing the difference between their shift start and end times.
 */
const StaffSummary = ({ employees = [], schedule = [] }) => {
  /**
   * Calculate weekly hours for a given employee.
   *
   * @param {string|number} employeeId The ID of the employee to calculate hours for.
   * @returns {number} The total hours worked by the employee in a week.
   */
  const calculateWeeklyHours = (employeeId) => {
    // Filter the schedule entries belonging to the given employee
    const employeeSchedule = schedule.filter((entry) => entry.employeeId === employeeId);
    return employeeSchedule.reduce((total, entry) => {
      // Parse start and end times into Date objects on an arbitrary date
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
                  {/* Circle with employee initial */}
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
                  {/* Weekly hours badge */}
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

// Provide a default export so this component can be imported without curly braces
export default StaffSummary;