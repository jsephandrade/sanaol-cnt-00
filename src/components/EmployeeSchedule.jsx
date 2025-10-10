import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { useEmployees, useSchedule } from '@/hooks/useEmployees';
import { useLocation, useNavigate } from 'react-router-dom';

import ManageEmployeesDialog from '@/components/employee-schedule/ManageEmployeesDialog';
import AddScheduleDialog from '@/components/employee-schedule/AddScheduleDialog';
import WeeklyScheduleCard from '@/components/employee-schedule/WeeklyScheduleCard';
import EditScheduleDialog from '@/components/employee-schedule/EditScheduleDialog';
import StaffOverviewCard from '@/components/employee-schedule/StaffOverviewCard';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';
import AttendanceAdmin from '@/components/AttendanceAdmin';
import LeaveManagement from '@/components/LeaveManagement';
import AttendanceTimeCard from '@/components/employee-schedule/AttendanceTimeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const DEFAULT_SCHEDULE_ENTRY = {
  employeeId: '',
  employeeName: '',
  day: '',
  startTime: '',
  endTime: '',
};

const DEFAULT_EMPLOYEE = {
  name: '',
  position: '',
  hourlyRate: 0,
  contact: '',
};

const EmployeeSchedule = () => {
  const { hasAnyRole, user } = useAuth();
  const canManage = hasAnyRole(['manager', 'admin']);
  const isStaffOnly = hasAnyRole(['staff']) && !canManage;
  const location = useLocation();
  const navigate = useNavigate();

  const { employees = [], addEmployee } = useEmployees();

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
  } = useSchedule({}, { autoFetch: true });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [newScheduleEntry, setNewScheduleEntry] = useState({
    ...DEFAULT_SCHEDULE_ENTRY,
  });
  const [newEmployee, setNewEmployee] = useState({ ...DEFAULT_EMPLOYEE });
  const [activeTab, setActiveTab] = useState('schedule');
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);

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

    if ((openFromSearch || openFromState) && !attendanceDialogOpen) {
      setAttendanceDialogOpen(true);

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
    }
  }, [attendanceDialogOpen, isStaffOnly, location, navigate]);

  useEffect(() => {
    if (!location.state?.openAttendancePopup) return;

    if (!attendanceDialogOpen) {
      setAttendanceDialogOpen(true);
    }

    const { openAttendancePopup, attendanceNavTimestamp, ...restState } =
      location.state || {};

    const nextState = Object.keys(restState).length > 0 ? restState : undefined;

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
  }, [
    attendanceDialogOpen,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  const lookupEmployeeName = (employeeId) =>
    displayEmployees.find((e) => e?.id === employeeId)?.name || 'Unknown';

  const toMinutes = (time) => {
    if (!time) return NaN;
    const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) return NaN;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const handleAddEmployee = async () => {
    if (!canManage) return;
    const { name, position, hourlyRate, contact } = newEmployee;
    if (!name?.trim() || !position?.trim()) {
      toast.error('Please provide employee name and position');
      return;
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
      });

      setNewEmployee({ ...DEFAULT_EMPLOYEE });
      setEmployeeDialogOpen(false);
    } catch (error) {
      console.error(error);
      // Errors are already surfaced via useEmployees toast handler.
    }
  };

  const handleAddSchedule = async () => {
    if (!canManage) return;
    const { employeeId, day, startTime, endTime } = newScheduleEntry;

    if (!employeeId || !day || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error('Invalid time range');
      return;
    }

    if (
      schedule.some(
        (entry) => entry?.employeeId === employeeId && entry?.day === day
      )
    ) {
      toast.error('Schedule already exists for this day');
      return;
    }

    try {
      await addScheduleEntry({
        ...newScheduleEntry,
        employeeName: lookupEmployeeName(employeeId),
      });
      setDialogOpen(false);
      setNewScheduleEntry({ ...DEFAULT_SCHEDULE_ENTRY });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add schedule');
    }
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule || !canManage) return;
    const start = toMinutes(editingSchedule?.startTime);
    const end = toMinutes(editingSchedule?.endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      toast.error('Invalid time range');
      return;
    }

    try {
      await updateScheduleEntry(editingSchedule?.id, editingSchedule);
      setEditingSchedule(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!canManage) return;

    const confirmDelete =
      typeof window !== 'undefined'
        ? window.confirm('Delete this schedule entry?')
        : true;

    if (!confirmDelete) return;

    try {
      await deleteScheduleEntry(id);
      toast.success('Deleted schedule');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete schedule');
    }
  };

  const scheduleContent = (
    <>
      <div className="mt-2 space-y-6">
        <div className="grid gap-2 items-start lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(0,0.6fr)]">
          <WeeklyScheduleCard
            daysOfWeek={DAYS_OF_WEEK}
            employeeList={displayEmployees}
            schedule={schedule}
            onEditSchedule={setEditingSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onAddScheduleForDay={(employeeId, day) => {
              if (!canManage) return;
              setNewScheduleEntry({
                ...DEFAULT_SCHEDULE_ENTRY,
                employeeId,
                employeeName: lookupEmployeeName(employeeId),
                day,
              });
              setDialogOpen(true);
            }}
            onOpenManageEmployees={() =>
              canManage && setEmployeeDialogOpen(true)
            }
            onOpenAddSchedule={() => canManage && setDialogOpen(true)}
            canManage={canManage}
          />
          <div className="space-y-6 lg:w-full lg:max-w-md lg:justify-self-end">
            <ScheduleCalendar
              schedule={schedule}
              employeeList={displayEmployees}
              className="w-full max-w-none lg:max-w-sm lg:ml-auto"
            />
            {user && !isStaffOnly ? (
              <AttendanceTimeCard user={user} className="w-full" />
            ) : null}
          </div>
        </div>

        {displayEmployees.length > 0 && (
          <StaffOverviewCard
            employeeList={displayEmployees}
            schedule={schedule}
          />
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {canManage ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex w-full flex-wrap gap-2 justify-start w-fit">
            <TabsTrigger
              value="schedule"
              className="min-w-[160px] flex-1 sm:flex-none"
            >
              Weekly Schedule
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="min-w-[160px] flex-1 sm:flex-none"
            >
              Attendance Records
            </TabsTrigger>
            <TabsTrigger
              value="leave"
              className="min-w-[160px] flex-1 sm:flex-none"
            >
              Leave Requests
            </TabsTrigger>
          </TabsList>
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

      <EditScheduleDialog
        editingSchedule={editingSchedule}
        setEditingSchedule={setEditingSchedule}
        daysOfWeek={DAYS_OF_WEEK}
        employeeList={displayEmployees}
        onSave={handleEditSchedule}
      />

      <ManageEmployeesDialog
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        newEmployee={newEmployee}
        setNewEmployee={setNewEmployee}
        onAddEmployee={handleAddEmployee}
        showTrigger={false}
      />

      <AddScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        newScheduleEntry={newScheduleEntry}
        setNewScheduleEntry={setNewScheduleEntry}
        employeeList={displayEmployees}
        daysOfWeek={DAYS_OF_WEEK}
        onAddSchedule={handleAddSchedule}
        showTrigger={false}
      />

      {user && (
        <Dialog
          open={attendanceDialogOpen}
          onOpenChange={setAttendanceDialogOpen}
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
