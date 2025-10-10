import React from 'react';
import { Button } from '@/components/ui/button';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
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
  const headerActions = canManage ? (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs font-medium"
        onClick={onOpenManageEmployees}
      >
        Manage Employees
      </Button>
      <Button
        size="sm"
        className="h-8 px-3 text-xs font-semibold"
        onClick={onOpenAddSchedule}
      >
        Add Schedule
      </Button>
    </div>
  ) : null;

  return (
    <FeaturePanelCard
      badgeText="Weekly Schedule"
      description="Employee shifts for the current week"
      headerActions={headerActions}
      contentClassName="space-y-4"
    >
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
            <div className="mb-4 grid grid-cols-8 gap-2 border-b pb-2">
              <div className="col-span-1 text-left text-sm font-semibold">
                Employee
              </div>
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-semibold">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Schedule Rows */}
            <div className="space-y-3">
              {employeeList.map((employee) => (
                <div
                  key={employee.id}
                  className="grid min-h-[40px] grid-cols-8 items-center gap-1"
                >
                  <div className="col-span-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-medium">
                        {employee.name}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground">
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
                          <div className="w-full rounded border border-primary/20 bg-primary/10 p-1 text-[10px]">
                            <div className="text-center font-medium">
                              {entry.startTime} - {entry.endTime}
                            </div>
                            {canManage && (
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => onEditSchedule(entry)}
                                  className="p-0.5 text-primary hover:text-primary/80"
                                  title="Edit schedule"
                                >
                                  <Edit size={10} />
                                </button>
                                <button
                                  onClick={() => onDeleteSchedule(entry.id)}
                                  className="p-0.5 text-destructive hover:text-destructive/80"
                                  title="Delete schedule"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-8 w-full items-center justify-center rounded-md border border-dashed border-muted hover:border-primary/30">
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
                                —
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
    </FeaturePanelCard>
  );
};

export default WeeklyScheduleCard;
