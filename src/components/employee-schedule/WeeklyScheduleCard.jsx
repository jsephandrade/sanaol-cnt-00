import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import {
  MoreHorizontal,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  UserPlus,
  Users,
  Briefcase,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

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

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const days = daysOfWeek.filter((day) => day !== 'Sunday');
    const grouped = {};

    days.forEach((day) => {
      grouped[day] = [];
      employeeList.forEach((employee) => {
        const entry = scheduleMap.get(`${employee.id}-${day}`);
        if (entry) {
          grouped[day].push({
            ...entry,
            employee,
          });
        }
      });
    });

    return grouped;
  }, [daysOfWeek, employeeList, scheduleMap]);

  const headerActions = canManage ? (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onOpenManageEmployees}
      >
        <Users className="h-4 w-4" />
        Team
      </Button>
      <Button size="sm" className="gap-2" onClick={onOpenAddSchedule}>
        <Plus className="h-4 w-4" />
        New Shift
      </Button>
    </div>
  ) : null;

  return (
    <FeaturePanelCard
      badgeText="Weekly Schedule"
      description="Manage employee shifts across the week"
      headerActions={headerActions}
      contentClassName="space-y-4"
    >
      {employeeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-12 text-center">
          <div className="rounded-full bg-background shadow-lg p-4 mb-6">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <h3 className="font-bold text-2xl mb-2">Build Your Team</h3>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            {canManage
              ? 'Start by adding team members and assigning their work schedules.'
              : "Your team schedule will appear here once it's set up."}
          </p>
          {canManage && (
            <div className="flex gap-3">
              <Button
                onClick={onOpenManageEmployees}
                size="lg"
                className="gap-2"
              >
                <Users className="h-5 w-5" />
                Add Team Members
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* List View by Day */}
          {daysOfWeek
            .filter((day) => day !== 'Sunday')
            .map((day) => {
              const daySchedules = schedulesByDay[day] || [];

              return (
                <div key={day} className="space-y-2">
                  {/* Day Header */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 border">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-base">{day}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {daySchedules.length}{' '}
                        {daySchedules.length === 1 ? 'shift' : 'shifts'}
                      </Badge>
                    </div>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => onOpenAddSchedule()}
                      >
                        <Plus className="h-4 w-4" />
                        Add Shift
                      </Button>
                    )}
                  </div>

                  {/* Shifts List */}
                  {daySchedules.length > 0 ? (
                    <div className="space-y-1 pl-2">
                      {daySchedules.map((shift) => (
                        <div
                          key={shift.id}
                          className="group flex items-center justify-between bg-background hover:bg-muted/30 border rounded-lg px-4 py-3 transition-colors cursor-pointer"
                          onClick={() => onEditSchedule(shift)}
                        >
                          {/* Left: Employee Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-9 w-9 ring-2 ring-background">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {shift.employee.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {shift.employee.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  <span className="truncate">
                                    {shift.employee.position || 'Staff'}
                                  </span>
                                </div>
                                {shift.employee.hourlyRate > 0 && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">
                                        {pesoFormatter.format(
                                          shift.employee.hourlyRate
                                        )}
                                        /hr
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle: Time Range */}
                          <div className="flex items-center gap-4 mx-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium">
                                Start:
                              </span>
                              <Badge
                                variant="outline"
                                className="font-mono text-xs text-green-600"
                              >
                                {formatTimeLabel(shift.startTime)}
                              </Badge>
                            </div>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium">
                                End:
                              </span>
                              <Badge
                                variant="outline"
                                className="font-mono text-xs text-orange-600"
                              >
                                {formatTimeLabel(shift.endTime)}
                              </Badge>
                            </div>
                          </div>

                          {/* Right: Duration & Actions */}
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className="text-xs gap-1 font-medium"
                            >
                              <Clock className="h-3 w-3" />
                              {(() => {
                                const start = new Date(
                                  `2000-01-01T${shift.startTime}`
                                );
                                const end = new Date(
                                  `2000-01-01T${shift.endTime}`
                                );
                                const hours = (end - start) / (1000 * 60 * 60);
                                return `${hours.toFixed(1)}h`;
                              })()}
                            </Badge>

                            {canManage && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditSchedule(shift);
                                    }}
                                  >
                                    Edit Shift
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSchedule(shift.id);
                                    }}
                                  >
                                    Delete Shift
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-center border border-dashed rounded-lg bg-muted/20 ml-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm">No shifts scheduled</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </FeaturePanelCard>
  );
};

export default WeeklyScheduleCard;
