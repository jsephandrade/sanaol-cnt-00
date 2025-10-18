import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import FeaturePanelCard from '../shared/FeaturePanelCard';
import { cn } from '@/lib/utils';

const AttendanceTimeCard = ({ user, className }) => {
  const subjectEmployeeId = useMemo(() => {
    if (!user) return null;
    return user.employeeId ?? user.employee?.id ?? null;
  }, [user]);
  const attendanceEnabled = Boolean(subjectEmployeeId);

  const attendanceParams = useMemo(() => {
    if (!subjectEmployeeId) return {};
    return { employeeId: subjectEmployeeId };
  }, [subjectEmployeeId]);

  const {
    records = [],
    createRecord,
    updateRecord,
    setParams,
  } = useAttendance(attendanceParams, { enabled: attendanceEnabled });

  const toLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  const todayStr = () => toLocalDateStr(new Date());
  const nowTime = () => {
    const current = new Date();
    return `${String(current.getHours()).padStart(2, '0')}:${String(
      current.getMinutes()
    ).padStart(2, '0')}:${String(current.getSeconds()).padStart(2, '0')}`;
  };

  const today = todayStr();
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!attendanceEnabled || !subjectEmployeeId) return;

    setParams((prev = {}) => {
      const nextId = String(subjectEmployeeId);
      const prevId =
        prev && prev.employeeId != null ? String(prev.employeeId) : null;
      if (prevId === nextId) return prev;
      return { ...prev, employeeId: subjectEmployeeId };
    });
  }, [attendanceEnabled, subjectEmployeeId, setParams]);

  const todayRecord = useMemo(() => {
    if (!attendanceEnabled || !subjectEmployeeId) return undefined;
    const targetId = String(subjectEmployeeId);
    return records.find(
      (record) =>
        record &&
        record.date === today &&
        record.employeeId != null &&
        String(record.employeeId) === targetId
    );
  }, [attendanceEnabled, records, subjectEmployeeId, today]);

  const handleTimeIn = async () => {
    if (!attendanceEnabled) {
      toast.error(
        'Attendance tracking is unavailable. Please contact your manager.'
      );
      return;
    }
    if (!subjectEmployeeId) {
      toast.error('Unable to identify user for attendance.');
      return;
    }
    if (todayRecord?.checkIn) {
      toast.error('Already timed in today.');
      return;
    }

    try {
      const created = await createRecord({
        employeeId: subjectEmployeeId,
        employeeName: user?.name || '',
        date: todayStr(),
        checkIn: nowTime(),
        status: 'present',
      });
      toast.success('Timed in successfully');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to time in');
    }
  };

  const handleTimeOut = async () => {
    if (!attendanceEnabled) {
      toast.error(
        'Attendance tracking is unavailable. Please contact your manager.'
      );
      return;
    }
    if (!subjectEmployeeId) {
      toast.error('Unable to identify user for attendance.');
      return;
    }
    if (!todayRecord || todayRecord.checkOut) {
      toast.error('No active time-in record today');
      return;
    }

    try {
      const updated = await updateRecord(todayRecord.id, {
        checkOut: nowTime(),
      });
      toast.success('Timed out successfully');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to time out');
    }
  };

  const parseTimeToDate = (timeStr) => {
    if (!timeStr) return null;
    const segments = timeStr.split(':');
    if (segments.length < 2) return null;
    const [hours = '0', minutes = '0', seconds = '0'] = segments;
    const h = Number.parseInt(hours, 10);
    const m = Number.parseInt(minutes, 10);
    const s = Number.parseInt(seconds, 10) || 0;
    if ([h, m, s].some((value) => Number.isNaN(value))) return null;
    const date = new Date();
    date.setHours(h, m, s, 0);
    return date;
  };

  const formatTo12Hour = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '--:--';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDuration = (milliseconds) => {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) return '--:--';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const checkInDate = useMemo(
    () => parseTimeToDate(todayRecord?.checkIn),
    [todayRecord?.checkIn]
  );
  const checkOutDate = useMemo(
    () => parseTimeToDate(todayRecord?.checkOut),
    [todayRecord?.checkOut]
  );

  const displayCurrentTime = formatTo12Hour(currentTime);

  const durationMs = useMemo(() => {
    if (!checkInDate) return null;
    const end = checkOutDate || currentTime;
    return end.getTime() - checkInDate.getTime();
  }, [checkInDate, checkOutDate, currentTime]);

  const statusConfig = useMemo(() => {
    if (!attendanceEnabled) {
      return {
        label: 'No Employee Profile',
        className: 'text-amber-600',
      };
    }
    if (!todayRecord) {
      return { label: 'Not Clocked In', className: 'text-muted-foreground' };
    }
    if (todayRecord.checkIn && !todayRecord.checkOut) {
      return { label: 'Clocked In', className: 'text-emerald-600' };
    }
    if (todayRecord.checkOut) {
      return { label: 'Clocked Out', className: 'text-red-600' };
    }
    return {
      label: todayRecord.status || 'Unknown Status',
      className: 'text-muted-foreground',
    };
  }, [attendanceEnabled, todayRecord]);

  const hasTimedInToday = attendanceEnabled && Boolean(todayRecord?.checkIn);
  const isClockedIn =
    attendanceEnabled &&
    Boolean(todayRecord?.checkIn && !todayRecord?.checkOut);
  const canTimeIn = attendanceEnabled && !todayRecord?.checkIn;
  const canTimeOut =
    attendanceEnabled &&
    Boolean(todayRecord?.checkIn) &&
    !todayRecord?.checkOut;
  const showUnavailableMessage = !attendanceEnabled;
  const availabilityNotice =
    'Attendance tracking is unavailable because your account is not linked to an employee profile yet. Please contact your manager.';

  return (
    <FeaturePanelCard
      className={cn('w-full', className)}
      badgeText="Daily Time Record"
      badgeClassName="whitespace-nowrap tracking-[0.12em]"
      description="Monitor today's clock-ins and duration."
      contentClassName="space-y-6"
    >
      <div className="space-y-2 text-center">
        <div className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {displayCurrentTime}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Status:{' '}
          <span className={cn('font-semibold', statusConfig.className)}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {showUnavailableMessage ? (
        <div className="rounded-md border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {availabilityNotice}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className={cn(
            'flex-1 min-w-[140px] border-2 border-emerald-600 bg-emerald-600 text-white transition-colors hover:bg-emerald-600/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60'
          )}
          onClick={handleTimeIn}
          disabled={!canTimeIn}
        >
          <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
          Time In
        </Button>
        <Button
          size="lg"
          className={cn(
            'flex-1 min-w-[140px] border-2 bg-red-500 text-white transition-opacity hover:bg-red-500/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500',
            !canTimeOut ? 'cursor-not-allowed opacity-70' : 'opacity-100'
          )}
          onClick={handleTimeOut}
          disabled={!canTimeOut}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Time Out
        </Button>
      </div>

      <div className="space-y-1 text-center text-sm text-muted-foreground">
        <div>
          Time In:{' '}
          <span className="font-semibold text-foreground">
            {checkInDate ? formatTo12Hour(checkInDate) : '--:--'}
          </span>
        </div>
        <div>
          Time Out:{' '}
          <span className="font-semibold text-foreground">
            {checkOutDate ? formatTo12Hour(checkOutDate) : '--:--'}
          </span>
        </div>
        <div>
          Duration:{' '}
          <span
            className={cn(
              'font-semibold',
              isClockedIn ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {durationMs != null ? formatDuration(durationMs) : '--:--'}
          </span>
        </div>
      </div>
    </FeaturePanelCard>
  );
};

export default AttendanceTimeCard;
