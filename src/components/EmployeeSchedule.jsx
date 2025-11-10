import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { useEmployees, useSchedule } from '@/hooks/useEmployees';
import { useScheduleOverview } from '@/hooks/useScheduleOverview';
import { useLocation, useNavigate } from 'react-router-dom';

import WeeklyScheduleCard from '@/components/employee-schedule/WeeklyScheduleCard';
import EmployeeDirectoryPanel from '@/components/employee-schedule/EmployeeDirectoryPanel';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';
import AttendanceAdmin from '@/components/AttendanceAdmin';
import LeaveManagement from '@/components/LeaveManagement';
import AttendanceTimeCard from '@/components/employee-schedule/AttendanceTimeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ClipboardList, Plane, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const shallowEqual = (a = {}, b = {}) => {
  const aKeys = Object.keys(a || {});
  const bKeys = Object.keys(b || {});
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => {
    const aVal = a?.[key] ?? '';
    const bVal = b?.[key] ?? '';
    return aVal === bVal;
  });
};

const EmployeeSchedule = () => {
  const { hasAnyRole, user } = useAuth();
  const canManage = hasAnyRole(['manager', 'admin']);
  const isStaffOnly = hasAnyRole(['staff']) && !canManage;
  const location = useLocation();
  const navigate = useNavigate();

  const {
    employees = [],
    loading: employeesLoading,
    addEmployee,
    updateEmployee,
  } = useEmployees();

  const displayEmployees = useMemo(
    () =>
      employees.filter(
        (emp) => emp && emp.status !== 'inactive' && emp.status !== 'pending'
      ),
    [employees]
  );

  const {
    schedule = [],
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    loading: scheduleLoading,
    setParams: setScheduleParams,
  } = useSchedule({ employeeId: '', day: '' }, { autoFetch: true });

  const {
    overview,
    loading: overviewLoading,
    setParams: setOverviewParams,
    refetch: refetchOverview,
  } = useScheduleOverview({ employeeId: '', day: '' }, { autoFetch: true });

  const [activeTab, setActiveTab] = useState('schedule');
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [scheduleFilters, setScheduleFilters] = useState({
    employeeId: '',
    day: '_all',
  });
  const attendanceAutoOpenDismissed = useRef(false);

  const hasShiftToday = useMemo(() => {
    // Check if user has a linked Employee record
    const userEmployeeId = user?.employeeId || user?.id;
    if (!userEmployeeId || !Array.isArray(schedule) || schedule.length === 0) {
      return false;
    }

    const todayIndex = new Date().getDay();
    const todayName = DAYS_OF_WEEK[todayIndex] || '';
    if (!todayName) return false;
    const normalize = (value) =>
      typeof value === 'string' ? value.trim().toLowerCase() : '';
    const todayKey = normalize(todayName);

    return schedule.some((entry) => {
      if (!entry) return false;
      const entryEmployeeId =
        entry.employeeId ??
        entry.employee?.id ??
        entry.employee?.employeeId ??
        null;
      if (entryEmployeeId == null) return false;
      // Compare with user's employeeId (preferred) or fall back to user.id for backwards compat
      if (String(entryEmployeeId) !== String(userEmployeeId)) return false;
      return normalize(entry.day) === todayKey;
    });
  }, [schedule, user?.employeeId, user?.id]);

  useEffect(() => {
    if (!canManage && activeTab !== 'schedule') {
      setActiveTab('schedule');
    }
  }, [canManage, activeTab]);

  useEffect(() => {
    const payload = {
      employeeId: scheduleFilters.employeeId || '',
      day:
        scheduleFilters.day && scheduleFilters.day !== '_all'
          ? scheduleFilters.day
          : '',
    };
    setScheduleParams((prev) => (shallowEqual(prev, payload) ? prev : payload));
    setOverviewParams((prev) => (shallowEqual(prev, payload) ? prev : payload));
  }, [scheduleFilters, setScheduleParams, setOverviewParams]);

  useEffect(() => {
    if (!isStaffOnly) return;

    const searchParams = new URLSearchParams(location.search || '');
    const attendanceParam = (
      searchParams.get('attendance') || ''
    ).toLowerCase();
    const openFromSearch = ['1', 'true', 'yes'].includes(attendanceParam);
    const openFromState = Boolean(
      location.state && location.state.openAttendance
    );
    const requested = openFromSearch || openFromState;

    const clearAttendanceIndicators = () => {
      if (openFromSearch || searchParams.has('attendance')) {
        searchParams.delete('attendance');
        navigate(
          {
            pathname: location.pathname,
            search: searchParams.toString()
              ? `?${searchParams.toString()}`
              : '',
          },
          {
            replace: true,
            state: { ...(location.state || {}), openAttendance: false },
          }
        );
      } else if (openFromState) {
        navigate(location.pathname + (location.search || ''), {
          replace: true,
          state: { ...(location.state || {}), openAttendance: false },
        });
      }
    };

    if (!requested) return;

    if (scheduleLoading) return;

    if (!hasShiftToday) {
      clearAttendanceIndicators();
      return;
    }

    if (!attendanceDialogOpen) {
      setAttendanceDialogOpen(true);
    }

    clearAttendanceIndicators();
  }, [
    attendanceDialogOpen,
    hasShiftToday,
    isStaffOnly,
    location,
    scheduleLoading,
    navigate,
  ]);

  useEffect(() => {
    if (!location.state?.openAttendancePopup) return;

    if (scheduleLoading) return;

    const { openAttendancePopup, attendanceNavTimestamp, ...restState } =
      location.state || {};

    const nextState = Object.keys(restState).length > 0 ? restState : undefined;

    const clearPopupState = () => {
      navigate(
        {
          pathname: location.pathname,
          search: location.search || '',
        },
        {
          replace: true,
          state: nextState,
        }
      );
    };

    if (!hasShiftToday) {
      clearPopupState();
      return;
    }

    if (!attendanceDialogOpen) {
      setAttendanceDialogOpen(true);
    }

    clearPopupState();
  }, [
    attendanceDialogOpen,
    hasShiftToday,
    location.pathname,
    location.search,
    location.state,
    scheduleLoading,
    navigate,
  ]);

  const handleAttendanceDialogChange = (open) => {
    if (!open) {
      attendanceAutoOpenDismissed.current = true;
    }
    setAttendanceDialogOpen(open);
  };

  useEffect(() => {
    if (!isStaffOnly) return;

    const normalizedPath = (location.pathname || '').replace(/\/+$/, '') || '/';
    const matchesEmployeesRoute =
      normalizedPath === '/employees' || normalizedPath === '/employeed';

    if (!matchesEmployeesRoute) {
      attendanceAutoOpenDismissed.current = false;
      return;
    }

    if (scheduleLoading || !hasShiftToday) return;
    if (attendanceDialogOpen || attendanceAutoOpenDismissed.current) return;

    attendanceAutoOpenDismissed.current = true;
    setAttendanceDialogOpen(true);
  }, [
    attendanceDialogOpen,
    hasShiftToday,
    isStaffOnly,
    location.pathname,
    scheduleLoading,
  ]);

  const lookupEmployeeName = (employeeId) =>
    displayEmployees.find((e) => e?.id === employeeId)?.name || 'Unknown';

  const toMinutes = (time) => {
    if (!time) return NaN;
    const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) return NaN;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const validateShiftPayload = (entry, { ignoreId } = {}) => {
    const normalizedEmployeeId = entry?.employeeId
      ? String(entry.employeeId)
      : '';
    const normalizedDay = entry?.day || '';
    const startTime = entry?.startTime || '';
    const endTime = entry?.endTime || '';

    if (!normalizedEmployeeId || !normalizedDay || !startTime || !endTime) {
      toast.error('Complete all shift fields before saving');
      return false;
    }

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error('Invalid time range');
      return false;
    }

    const hasDuplicate = schedule.some((entryItem) => {
      if (!entryItem) return false;
      if (ignoreId && entryItem.id === ignoreId) return false;
      return (
        String(entryItem.employeeId) === normalizedEmployeeId &&
        entryItem.day === normalizedDay
      );
    });

    if (hasDuplicate) {
      toast.error('This employee already has a shift on that day');
      return false;
    }

    return true;
  };

  const handleCreateShift = async (entry) => {
    if (!canManage) return false;

    const payload = {
      employeeId: entry?.employeeId ? String(entry.employeeId) : '',
      day: entry?.day || '',
      startTime: entry?.startTime || '',
      endTime: entry?.endTime || '',
    };

    if (!validateShiftPayload(payload)) {
      return false;
    }

    try {
      await addScheduleEntry({
        ...payload,
        employeeName: lookupEmployeeName(payload.employeeId),
      });
      await refetchOverview();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to add shift');
      return false;
    }
  };

  const handleUpdateShift = async (entry) => {
    if (!canManage) return false;
    if (!entry?.id) {
      toast.error('Unable to update shift');
      return false;
    }

    const payload = {
      id: entry.id,
      employeeId: entry?.employeeId ? String(entry.employeeId) : '',
      day: entry?.day || '',
      startTime: entry?.startTime || '',
      endTime: entry?.endTime || '',
      employeeName:
        entry?.employeeName || lookupEmployeeName(entry?.employeeId),
    };

    if (!validateShiftPayload(payload, { ignoreId: entry.id })) {
      return false;
    }

    try {
      await updateScheduleEntry(entry.id, payload);
      await refetchOverview();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to update shift');
      return false;
    }
  };

  const handleDeleteShift = async (id) => {
    if (!canManage) return;

    const confirmDelete =
      typeof window !== 'undefined'
        ? window.confirm('Delete this schedule entry?')
        : true;

    if (!confirmDelete) return;

    try {
      await deleteScheduleEntry(id);
      toast.success('Deleted shift');
      await refetchOverview();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleCreateEmployee = async (payload) => {
    if (!canManage) return false;
    const { name, position, hourlyRate, contact, status } = payload || {};
    if (!name?.trim() || !position?.trim()) {
      toast.error('Please provide employee name and position');
      return false;
    }

    try {
      const sanitizedRate = Number.isFinite(Number(hourlyRate))
        ? Number(hourlyRate)
        : 0;
      await addEmployee({
        name: name.trim(),
        position: position.trim(),
        hourlyRate: sanitizedRate,
        contact: contact?.trim() || '',
        status: status ? String(status).toLowerCase() : 'active',
      });
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to add employee');
      return false;
    }
  };

  const handleUpdateEmployeeRecord = async (id, updates) => {
    if (!canManage) return false;
    if (!id) {
      toast.error('Select an employee to update');
      return false;
    }

    const { name, position, hourlyRate, contact, status } = updates || {};
    if (!name?.trim() || !position?.trim()) {
      toast.error('Please provide employee name and position');
      return false;
    }

    try {
      const sanitizedRate = Number.isFinite(Number(hourlyRate))
        ? Number(hourlyRate)
        : 0;
      await updateEmployee(id, {
        name: name.trim(),
        position: position.trim(),
        hourlyRate: sanitizedRate,
        contact: contact?.trim() || '',
        status: status ? String(status).toLowerCase() : 'active',
      });
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to update employee');
      return false;
    }
  };

  const handleToggleEmployeeStatus = async (employee, nextStatus) => {
    if (!canManage || !employee?.id) return false;
    try {
      await updateEmployee(employee.id, {
        name: employee.name || '',
        position: employee.position || '',
        hourlyRate:
          typeof employee.hourlyRate === 'number'
            ? employee.hourlyRate
            : Number(employee.hourlyRate || 0),
        contact: employee.contact || '',
        status: nextStatus,
      });
      toast.success(
        nextStatus === 'inactive' ? 'Employee archived' : 'Employee restored'
      );
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to update employee status');
      return false;
    }
  };

  const scheduleContent = (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <WeeklyScheduleCard
            daysOfWeek={DAYS_OF_WEEK}
            employeeList={displayEmployees}
            schedule={schedule}
            overview={overview}
            overviewLoading={overviewLoading}
            scheduleLoading={scheduleLoading}
            filters={scheduleFilters}
            onFiltersChange={setScheduleFilters}
            onCreateShift={handleCreateShift}
            onUpdateShift={handleUpdateShift}
            onDeleteShift={handleDeleteShift}
            canManage={canManage}
          />
        </div>
        <div className="space-y-4">
          <ScheduleCalendar
            schedule={schedule}
            employeeList={displayEmployees}
            className="w-full"
          />
          {user && !isStaffOnly ? (
            <AttendanceTimeCard user={user} className="w-full" />
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {canManage ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex w-full flex-wrap items-center justify-between gap-1 sm:w-fit sm:justify-start sm:gap-2">
            {canManage ? (
              <TabsTrigger
                value="employees"
                aria-label="Employee List"
                className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline sm:ml-2">Employee List</span>
              </TabsTrigger>
            ) : null}
            <TabsTrigger
              value="schedule"
              aria-label="Weekly Schedule"
              className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline sm:ml-2">Weekly Schedule</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              aria-label="Attendance Records"
              className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline sm:ml-2">
                Attendance Records
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="leave"
              aria-label="Leave Records"
              className="flex-1 min-w-[52px] px-2 sm:flex-none sm:min-w-0 sm:px-3"
            >
              <Plane className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline sm:ml-2">Leave Records</span>
            </TabsTrigger>
          </TabsList>
          {canManage ? (
            <TabsContent value="employees" className="space-y-6">
              {activeTab === 'employees' ? (
                <EmployeeDirectoryPanel
                  employees={employees}
                  loading={employeesLoading}
                  onCreateEmployee={handleCreateEmployee}
                  onUpdateEmployee={handleUpdateEmployeeRecord}
                  onToggleEmployeeStatus={handleToggleEmployeeStatus}
                  canManage={canManage}
                />
              ) : null}
            </TabsContent>
          ) : null}
          <TabsContent value="schedule" className="space-y-6">
            {activeTab === 'schedule' ? scheduleContent : null}
          </TabsContent>
          <TabsContent value="attendance" className="space-y-6">
            {activeTab === 'attendance' ? <AttendanceAdmin /> : null}
          </TabsContent>
          <TabsContent value="leave" className="space-y-6">
            {activeTab === 'leave' ? <LeaveManagement /> : null}
          </TabsContent>
        </Tabs>
      ) : (
        scheduleContent
      )}

      {user && (
        <Dialog
          open={attendanceDialogOpen}
          onOpenChange={handleAttendanceDialogChange}
        >
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Record Your Attendance</DialogTitle>
              <DialogDescription>
                Track today's time in and time out.
              </DialogDescription>
            </DialogHeader>
            <AttendanceTimeCard user={user} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeSchedule;
