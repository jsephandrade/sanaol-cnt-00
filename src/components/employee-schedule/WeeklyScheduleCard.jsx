import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import {
  Edit,
  Trash2,
  Plus,
  Clock,
  Calendar,
  UserPlus,
  Users,
} from 'lucide-react';

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
        className="h-9 gap-2"
        onClick={onOpenManageEmployees}
      >
        <Users className="h-4 w-4" />
        Manage Employees
      </Button>
      <Button size="sm" className="h-9 gap-2" onClick={onOpenAddSchedule}>
        <Calendar className="h-4 w-4" />
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
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg border-2 border-dashed p-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No employees added yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {canManage
              ? 'Get started by adding employees to your team and creating their schedules.'
              : 'Please check back once the team list is ready.'}
          </p>
          {canManage && (
            <Button onClick={onOpenManageEmployees} className="gap-2">
              <Users className="h-4 w-4" />
              Manage Employees
            </Button>
          )}
        </div>
      ) : (
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="w-full min-w-[960px]">
              {/* Header Row */}
              <div className="mb-3 grid grid-cols-[minmax(240px,1.5fr)_repeat(6,minmax(120px,1fr))] gap-3 pb-3 border-b">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Employee</span>
                </div>
                {daysOfWeek
                  .filter((day) => day !== 'Sunday')
                  .map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold"
                    >
                      {day}
                    </div>
                  ))}
              </div>

              {/* Employee Rows */}
              <div className="space-y-3">
                {employeeList.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid grid-cols-[minmax(240px,1.5fr)_repeat(6,minmax(120px,1fr))] items-center gap-3"
                  >
                    {/* Employee Info Card */}
                    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm hover:shadow transition-shadow">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {employee.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {employee.name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {employee.position || 'Role not set'}
                        </p>
                      </div>
                    </div>

                    {/* Day Schedule Cells */}
                    {daysOfWeek
                      .filter((day) => day !== 'Sunday')
                      .map((day) => {
                        const entry = scheduleMap.get(`${employee.id}-${day}`);

                        return (
                          <div
                            key={day}
                            className="flex items-center justify-center"
                          >
                            {entry ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                    className="group relative w-full rounded-lg border bg-primary/5 hover:bg-primary/10 p-3 cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                  >
                                    {/* Time Display */}
                                    <div className="flex flex-col gap-1 text-center">
                                      <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-600">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {formatTimeLabel(entry.startTime)}
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        to
                                      </div>
                                      <div className="flex items-center justify-center gap-1 text-xs font-medium text-orange-600">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {formatTimeLabel(entry.endTime)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons (appears on hover) */}
                                    {canManage && (
                                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button
                                          size="icon"
                                          variant="secondary"
                                          className="h-6 w-6 rounded-full shadow-lg"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            onEditSchedule(entry);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="destructive"
                                          className="h-6 w-6 rounded-full shadow-lg"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            onDeleteSchedule(entry.id);
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {formatTimeLabel(entry.startTime)} -{' '}
                                    {formatTimeLabel(entry.endTime)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <div className="w-full rounded-lg border-2 border-dashed bg-muted/30 p-3 flex items-center justify-center min-h-[80px]">
                                {canManage ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-primary/10"
                                        onClick={() =>
                                          onAddScheduleForDay(employee.id, day)
                                        }
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">
                                        Add schedule for {day}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Off
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
        </TooltipProvider>
      )}
    </FeaturePanelCard>
  );
};

export default WeeklyScheduleCard;
