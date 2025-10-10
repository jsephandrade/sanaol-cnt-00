import React, { useMemo } from 'react';
import { useStaffAttendanceReport } from '@/hooks/useReports';
import { useEmployees, useSchedule } from '@/hooks/useEmployees';
import { formatMethodLabel } from '../common/utils';
import AttendanceStatusChart from './AttendanceStatusChart';
import StaffRosterTable from './StaffRosterTable';
import ScheduledHoursChart from './ScheduledHoursChart';

export default function AttendancePanel() {
  const {
    data: attendanceSummary,
    loading: attendanceLoading,
    error: attendanceError,
  } = useStaffAttendanceReport();
  const {
    employees,
    loading: employeesLoading,
    error: employeesError,
  } = useEmployees();
  const {
    schedule,
    loading: scheduleLoading,
    error: scheduleError,
  } = useSchedule();

  const toHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = String(start).split(':').map(Number);
    const [eh, em] = String(end).split(':').map(Number);
    if (Number.isNaN(sh) || Number.isNaN(eh)) return 0;
    return eh + (em || 0) / 60 - (sh + (sm || 0) / 60);
  };

  const hours = useMemo(() => {
    if (!schedule.length) return [];
    const nameById = Object.fromEntries(
      employees.map((employee) => [employee.id, employee.name])
    );
    const totals = new Map();

    schedule.forEach((entry) => {
      const duration = toHours(entry.startTime, entry.endTime);
      const name =
        entry.employeeName || nameById[entry.employeeId] || 'Unknown';
      totals.set(name, (totals.get(name) || 0) + duration);
    });

    return Array.from(totals.entries()).map(([name, value]) => ({
      name,
      hours: Math.round(value * 10) / 10,
    }));
  }, [employees, schedule]);

  const statusData = useMemo(() => {
    const entries = attendanceSummary?.byStatus ?? [];
    return entries.map((entry) => ({
      name: formatMethodLabel(entry.status),
      count: entry.count,
    }));
  }, [attendanceSummary]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AttendanceStatusChart
        data={statusData}
        loading={attendanceLoading}
        error={attendanceError}
      />

      <StaffRosterTable
        employees={employees}
        loading={employeesLoading}
        error={employeesError}
      />

      <ScheduledHoursChart
        data={hours}
        loading={scheduleLoading}
        error={scheduleError}
      />
    </div>
  );
}
