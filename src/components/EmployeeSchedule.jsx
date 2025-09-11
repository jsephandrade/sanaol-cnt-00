import React, { useEffect, useMemo, useState } from 'react';
import { useEmployees, useSchedule } from '@/hooks/useEmployees';
import { toast } from 'sonner';
import ManageEmployeesDialog from '@/components/employee-schedule/ManageEmployeesDialog';
import AddScheduleDialog from '@/components/employee-schedule/AddScheduleDialog';
import WeeklyScheduleCard from '@/components/employee-schedule/WeeklyScheduleCard';
import CalendarViewCard from '@/components/employee-schedule/CalendarViewCard';
import EditScheduleDialog from '@/components/employee-schedule/EditScheduleDialog';
import AttendanceAdmin from '@/components/AttendanceAdmin';
import LeaveManagement from '@/components/LeaveManagement';
import { useAuth } from '@/components/AuthContext';

// Hoisted constant to avoid re-allocating every render
const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const EmployeeSchedule = () => {
  const { hasAnyRole, user } = useAuth();
  const { employees: employeeList, addEmployee } = useEmployees();
  const {
    schedule,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    setParams: setScheduleParams,
  } = useSchedule({}, { autoFetch: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    hourlyRate: 0,
    contact: '',
  });
  const [date, setDate] = useState(new Date());
  const [newScheduleEntry, setNewScheduleEntry] = useState({
    employeeId: '',
    employeeName: '',
    day: '',
    startTime: '',
    endTime: '',
  });

  // Compute once per render and reuse
  const canManage = hasAnyRole(['manager', 'admin']);

  const selfEmployee = useMemo(() => {
    if (user?.employeeId)
      return {
        id: String(user.employeeId),
        name: user?.name || 'Me',
        position: '',
      };
    const email = (user?.email || '').trim().toLowerCase();
    const name = (user?.name || '').trim().toLowerCase();
    let found = null;
    if (email)
      found =
        (employeeList || []).find(
          (e) => (e.contact || '').trim().toLowerCase() === email
        ) || null;
    if (!found && name)
      found =
        (employeeList || []).find(
          (e) => (e.name || '').trim().toLowerCase() === name
        ) || null;
    return found;
  }, [user?.employeeId, user?.name, employeeList, user?.email]);

  useEffect(() => {
    if (!canManage && selfEmployee?.id) {
      setScheduleParams({ employeeId: selfEmployee.id });
    }
  }, [canManage, selfEmployee?.id, setScheduleParams]);

  // Fallback: if employee list is empty, derive minimal list from schedule
  const displayEmployees = useMemo(() => {
    if (!canManage && selfEmployee?.id) return [selfEmployee];
    if (employeeList && employeeList.length > 0) return employeeList;
    const seen = new Map();
    (schedule || []).forEach((s) => {
      if (!seen.has(s.employeeId)) {
        seen.set(s.employeeId, {
          id: s.employeeId,
          name: s.employeeName || 'Employee',
          position: '',
        });
      }
    });
    return Array.from(seen.values());
  }, [canManage, selfEmployee, employeeList, schedule]);

  const lookupEmployeeName = (employeeId) => {
    const src =
      employeeList && employeeList.length > 0 ? employeeList : displayEmployees;
    const emp = src.find((e) => e.id === employeeId);
    return emp?.name || '';
  };

  // Basic time parsing: expects HH:MM 24h
  const toMinutes = (t) => {
    if (!t || typeof t !== 'string') return NaN;
    const m = t.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!m) return NaN;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  };

  const handleAddSchedule = async () => {
    if (!canManage) return; // guard for staff
    if (
      !newScheduleEntry.employeeId ||
      !newScheduleEntry.day ||
      !newScheduleEntry.startTime ||
      !newScheduleEntry.endTime
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate time format and ordering
    const start = toMinutes(newScheduleEntry.startTime);
    const end = toMinutes(newScheduleEntry.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      toast.error('Please enter times as HH:MM (24h)');
      return;
    }
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    // Enforce single shift per day per employee in this weekly view
    const exists = (schedule || []).some(
      (s) =>
        s.employeeId === newScheduleEntry.employeeId &&
        s.day === newScheduleEntry.day
    );
    if (exists) {
      toast.error('A schedule already exists for this employee on that day');
      return;
    }
    try {
      // Ensure employeeName is populated (backend may derive, but keep client consistent)
      const payload = {
        ...newScheduleEntry,
        employeeName:
          newScheduleEntry.employeeName ||
          lookupEmployeeName(newScheduleEntry.employeeId),
      };
      await addScheduleEntry(payload);
    } catch (e) {
      // toast already shown by hook
      try {
        console.error('Add schedule failed', e);
      } catch {}
      return;
    }
    setNewScheduleEntry({
      employeeId: '',
      employeeName: '',
      day: '',
      startTime: '',
      endTime: '',
    });

    setDialogOpen(false);
    // Success toast shown by hook
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule) return;
    if (!canManage) return; // guard for staff

    // Validate time edits
    const start = toMinutes(editingSchedule.startTime);
    const end = toMinutes(editingSchedule.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      toast.error('Please enter times as HH:MM (24h)');
      return;
    }
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }
    try {
      await updateScheduleEntry(editingSchedule.id, {
        employeeId: editingSchedule.employeeId,
        day: editingSchedule.day,
        startTime: editingSchedule.startTime,
        endTime: editingSchedule.endTime,
      });
      setEditingSchedule(null);
      // Success toast shown by hook
    } catch (e) {
      // toast already shown in hook
      try {
        console.error('Update schedule failed', e);
      } catch {}
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!canManage) return; // guard for staff

    // Confirm destructive action
    const ok =
      typeof window !== 'undefined'
        ? window.confirm('Delete this schedule entry?')
        : true;
    if (!ok) return;
    try {
      await deleteScheduleEntry(id);
      // Success toast shown by hook
    } catch (e) {
      // toast shown by hook
      try {
        console.error('Delete schedule failed', e);
      } catch {}
    }
  };

  const handleAddEmployee = async () => {
    if (!canManage) return; // guard for staff
    if (!newEmployee.name || !newEmployee.position || !newEmployee.contact) {
      toast.error('Please fill in all required fields');
      return;
    }
    const rate = Number(newEmployee.hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error('Hourly rate must be a positive number');
      return;
    }
    try {
      await addEmployee({
        ...newEmployee,
        hourlyRate: rate,
      });
    } catch (e) {
      // toast already shown
      try {
        console.error('Add employee failed', e);
      } catch {}
      return;
    }
    setNewEmployee({
      name: '',
      position: '',
      hourlyRate: 0,
      contact: '',
    });

    setEmployeeDialogOpen(false);
    // Success toast shown by hook
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Employee Schedule</h2>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Weekly Schedule */}
        <div className="lg:col-span-3 xl:col-span-4">
          <WeeklyScheduleCard
            daysOfWeek={DAYS_OF_WEEK}
            employeeList={displayEmployees}
            schedule={schedule}
            onEditSchedule={setEditingSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onAddScheduleForDay={(employeeId, day) => {
              if (!canManage) return; // guard for staff
              setNewScheduleEntry({
                employeeId,
                employeeName: lookupEmployeeName(employeeId),
                day,
                startTime: '',
                endTime: '',
              });
              setDialogOpen(true);
            }}
            onOpenManageEmployees={() => {
              if (!canManage) return;
              setEmployeeDialogOpen(true);
            }}
            onOpenAddSchedule={() => {
              if (!canManage) return;
              setDialogOpen(true);
            }}
            canManage={canManage}
          />
        </div>

        {/* Calendar */}
        <div className="lg:col-span-1 xl:col-span-1">
          <CalendarViewCard date={date} setDate={setDate} schedule={schedule} />
        </div>
      </div>

      {/* Attendance & Leaves (stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <AttendanceAdmin />
        </div>
        <div>
          <LeaveManagement />
        </div>
      </div>

      {/* Edit Dialog */}
      <EditScheduleDialog
        editingSchedule={editingSchedule}
        setEditingSchedule={setEditingSchedule}
        daysOfWeek={DAYS_OF_WEEK}
        employeeList={employeeList}
        onSave={handleEditSchedule}
      />
      {/* Dialogs mounted without internal triggers; buttons moved into WeeklyScheduleCard */}
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
        employeeList={employeeList}
        daysOfWeek={DAYS_OF_WEEK}
        onAddSchedule={handleAddSchedule}
        showTrigger={false}
      />
    </div>
  );
};

export default EmployeeSchedule;
// (moved displayEmployees useMemo inside component to obey Rules of Hooks)
