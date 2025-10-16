import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import FeaturePanelCard from '../shared/FeaturePanelCard';
import { cn } from '@/lib/utils';

const AttendanceTimeCard = ({ user, className }) => {
  const { records = [], createRecord, updateRecord } = useAttendance();

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

  const initialSubjectId = useMemo(
    () => user?.employeeId || user?.id,
    [user?.employeeId, user?.id]
  );
  const [resolvedEmployeeId, setResolvedEmployeeId] =
    useState(initialSubjectId);
  const today = todayStr();
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (user?.employeeId && user.employeeId !== resolvedEmployeeId) {
      setResolvedEmployeeId(user.employeeId);
    }
  }, [user?.employeeId, resolvedEmployeeId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!records || records.length === 0) return;
    const known = records.find((record) => record.employeeId)?.employeeId;
    if (known && known !== resolvedEmployeeId) {
      setResolvedEmployeeId(known);
    }
  }, [records, resolvedEmployeeId]);

  const todayRecord = useMemo(() => {
    const possibleIds = [resolvedEmployeeId, initialSubjectId].filter(Boolean);
    return records.find(
      (record) =>
        possibleIds.includes(record.employeeId) && record.date === today
    );
  }, [records, resolvedEmployeeId, initialSubjectId, today]);

  const selectedEmployeeId = resolvedEmployeeId || initialSubjectId;

  const handleTimeIn = async () => {
    if (!selectedEmployeeId) {
      toast.error('Unable to identify user for attendance.');
      return;
    }
    if (todayRecord?.checkIn) {
      toast.error('Already timed in today.');
      return;
    }

    try {
      const created = await createRecord({
        employeeId: selectedEmployeeId,
        employeeName: user?.name || '',
        date: todayStr(),
        checkIn: nowTime(),
        status: 'present',
      });
      if (created?.employeeId) {
        setResolvedEmployeeId(created.employeeId);
      }
      toast.success('Timed in successfully');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to time in');
    }
  };

  const handleTimeOut = async () => {
    if (!selectedEmployeeId) {
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
      if (updated?.employeeId) {
        setResolvedEmployeeId(updated.employeeId);
      }
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
  }, [todayRecord]);

  const hasTimedInToday = Boolean(todayRecord?.checkIn);
  const isClockedIn = Boolean(todayRecord?.checkIn && !todayRecord?.checkOut);
  const canTimeOut = Boolean(todayRecord?.checkIn) && !todayRecord?.checkOut;

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

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className={cn(
            'flex-1 min-w-[140px] border-2 border-emerald-600 bg-emerald-600 text-white transition-colors hover:bg-emerald-600/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60'
          )}
          onClick={handleTimeIn}
          disabled={hasTimedInToday}
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
