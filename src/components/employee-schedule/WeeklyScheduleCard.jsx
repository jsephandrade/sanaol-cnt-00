import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Group schedules by day (column-based view)
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
      contentClassName="space-y-6"
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
        <div className="space-y-6">
          {/* Column-based Day View */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {daysOfWeek
                .filter((day) => day !== 'Sunday')
                .map((day) => {
                  const daySchedules = schedulesByDay[day] || [];

                  return (
                    <Card
                      key={day}
                      className="flex-shrink-0 w-[280px] bg-muted/30"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base font-semibold">
                              {day}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {daySchedules.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Shift Cards */}
                        {daySchedules.length > 0 ? (
                          daySchedules.map((shift) => (
                            <Card
                              key={shift.id}
                              className="group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
                              onClick={() => onEditSchedule(shift)}
                            >
                              <CardContent className="p-4">
                                {/* Employee Info */}
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 ring-2 ring-background">
                                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                        {shift.employee.name
                                          ?.charAt(0)
                                          ?.toUpperCase() || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm truncate">
                                        {shift.employee.name}
                                      </p>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Briefcase className="h-3 w-3" />
                                        <span className="truncate">
                                          {shift.employee.position || 'Staff'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {canManage && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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

                                {/* Time Range */}
                                <div className="bg-background/60 rounded-lg p-2.5 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      Start
                                    </span>
                                    <span className="font-bold text-green-600">
                                      {formatTimeLabel(shift.startTime)}
                                    </span>
                                  </div>
                                  <Separator />
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      End
                                    </span>
                                    <span className="font-bold text-orange-600">
                                      {formatTimeLabel(shift.endTime)}
                                    </span>
                                  </div>
                                </div>

                                {/* Duration Badge */}
                                <div className="mt-2 flex justify-center">
                                  <Badge
                                    variant="outline"
                                    className="text-xs gap-1"
                                  >
                                    <Clock className="h-3 w-3" />
                                    {(() => {
                                      const start = new Date(
                                        `2000-01-01T${shift.startTime}`
                                      );
                                      const end = new Date(
                                        `2000-01-01T${shift.endTime}`
                                      );
                                      const hours =
                                        (end - start) / (1000 * 60 * 60);
                                      return `${hours.toFixed(1)}h`;
                                    })()}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-background p-3 mb-3">
                              <Clock className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              No shifts scheduled
                            </p>
                            {canManage && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => onOpenAddSchedule()}
                              >
                                <Plus className="h-3 w-3" />
                                Add Shift
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </FeaturePanelCard>
  );
};

export default WeeklyScheduleCard;
