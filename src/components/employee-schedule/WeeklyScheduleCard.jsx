import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';

const WeeklyScheduleCard = ({
  daysOfWeek,
  employeeList,
  schedule,
  onEditSchedule,
  onDeleteSchedule,
  onAddScheduleForDay,
  onOpenManageEmployees,
  onOpenAddSchedule,
  canManage = false,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Employee shifts for the current week
          </CardDescription>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onOpenManageEmployees}>
              Manage Employees
            </Button>
            <Button onClick={onOpenAddSchedule}>Add Schedule</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {employeeList.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No employees added yet.{' '}
              {canManage
                ? 'Use "Manage Employees" or "Add Schedule" to get started.'
                : 'Please check back once the team list is ready.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="w-full">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-4 pb-2 border-b">
                <div className="col-span-1 font-semibold text-left">
                  Employee
                </div>
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center font-semibold text-sm">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Schedule Rows */}
              <div className="space-y-3">
                {employeeList.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid grid-cols-8 gap-1 items-center min-h-[40px]"
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {employee.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-xs truncate block">
                          {employee.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {employee.position}
                        </span>
                      </div>
                    </div>

                    {daysOfWeek.map((day) => {
                      const entry = schedule.find(
                        (s) => s.employeeId === employee.id && s.day === day
                      );

                      return (
                        <div
                          key={day}
                          className="flex items-center justify-center"
                        >
                          {entry ? (
                            <div className="bg-primary/10 border border-primary/20 p-1 rounded w-full text-[10px]">
                              <div className="text-center font-medium">
                                {entry.startTime} - {entry.endTime}
                              </div>
                              {canManage && (
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => onEditSchedule(entry)}
                                    className="text-primary hover:text-primary/80 p-0.5"
                                    title="Edit schedule"
                                  >
                                    <Edit size={10} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteSchedule(entry.id)}
                                    className="text-destructive hover:text-destructive/80 p-0.5"
                                    title="Delete schedule"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border border-dashed border-muted rounded-md w-full h-8 flex items-center justify-center hover:border-primary/30">
                              {canManage ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-10 p-0 hover:bg-primary/10"
                                  onClick={() =>
                                    onAddScheduleForDay(employee.id, day)
                                  }
                                  title={`Add schedule for ${day}`}
                                >
                                  <Plus size={10} />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  �
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyScheduleCard;
