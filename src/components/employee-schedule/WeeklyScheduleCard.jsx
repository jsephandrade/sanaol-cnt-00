import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import { Edit, Trash2, Plus } from 'lucide-react';

const formatTimeLabel = (time) => {
  if (!time) return '--:--';
  const [hour = '00', minute = '00'] = String(time).split(':');
  const parsedHour = Number.parseInt(hour, 10);
  const parsedMinute = Number.parseInt(minute, 10);
  if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
    return '--:--';
  }
  const date = new Date();
  date.setHours(parsedHour, parsedMinute, 0, 0);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

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
  const scheduleMap = useMemo(() => {
    const map = new Map();
    schedule.forEach((entry) => {
      if (!entry?.employeeId || !entry?.day) return;
      const key = `${entry.employeeId}-${entry.day}`;
      map.set(key, entry);
    });
    return map;
  }, [schedule]);

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
          <div className="w-full min-w-[960px]">
            <div className="mb-4 grid grid-cols-[minmax(220px,1.4fr)_repeat(6,minmax(100px,1fr))] gap-2 border-b pb-2">
              <div className="text-left text-sm font-semibold">Employee</div>
              {daysOfWeek
                .filter((day) => day !== 'Sunday')
                .map((day) => (
                  <div
                    key={day}
                    className="text-center text-[13px] font-semibold tracking-tight"
                  >
                    {day.slice(0, 3)}
                  </div>
                ))}
            </div>

            <div className="space-y-4">
              {employeeList.map((employee) => (
                <div
                  key={employee.id}
                  className="grid grid-cols-[minmax(220px,1.4fr)_repeat(6,minmax(100px,1fr))] items-start gap-2"
                >
                  <div className="flex h-[3.5rem] items-center gap-3 rounded-2xl bg-sky-50/60 p-3 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-200 text-sm font-semibold text-sky-700">
                      {employee.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {employee.name || 'Unnamed'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {employee.position || 'Role not set'}
                      </p>
                    </div>
                  </div>

                  {daysOfWeek
                    .filter((day) => day !== 'Sunday')
                    .map((day) => {
                      const entry = scheduleMap.get(`${employee.id}-${day}`);

                      return (
                        <div
                          key={day}
                          className="flex items-center justify-center px-1"
                        >
                          {entry ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => onEditSchedule(entry)}
                              onKeyDown={(event) => {
                                if (
                                  event.key === 'Enter' ||
                                  event.key === ' '
                                ) {
                                  event.preventDefault();
                                  onEditSchedule(entry);
                                }
                              }}
                              className="flex h-[3.5rem] w-[6rem] cursor-pointer items-center justify-between rounded-[10px] border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-sky-100 px-2 text-left text-[12px] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1"
                              title="Edit schedule"
                            >
                              <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-emerald-600">
                                  {formatTimeLabel(entry.startTime)}
                                </span>
                                <span className="font-semibold text-red-500">
                                  {formatTimeLabel(entry.endTime)}
                                </span>
                              </div>
                              {canManage ? (
                                <div className="flex flex-col items-center gap-1 text-[10px]">
                                  <span className="rounded-full bg-white/80 p-1 text-slate-900 shadow-sm">
                                    <Edit size={11} />
                                  </span>
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onDeleteSchedule(entry.id);
                                    }}
                                    onKeyDown={(event) => {
                                      if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                      ) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onDeleteSchedule(entry.id);
                                      }
                                    }}
                                    className="rounded-full bg-white/80 p-1 text-red-500 shadow-sm transition hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                                    title="Delete schedule"
                                  >
                                    <Trash2 size={11} />
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="flex aspect-square h-[3.5rem] items-center justify-center rounded-[10px] border border-dashed border-sky-200 bg-sky-50/40">
                              {canManage ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full border border-sky-200 bg-white text-sky-600 transition hover:bg-sky-50"
                                  onClick={() =>
                                    onAddScheduleForDay(employee.id, day)
                                  }
                                  title={`Add schedule for ${day}`}
                                >
                                  <Plus size={12} />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  --
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
