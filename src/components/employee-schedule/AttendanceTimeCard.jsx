import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { cn } from '@/lib/utils';

const AttendanceTimeCard = ({ user, className }) => {
  const { records = [], createRecord, updateRecord } = useAttendance();

  const todayStr = () => new Date().toISOString().slice(0, 10);
  const nowTime = () => {
    const current = new Date();
    return `${String(current.getHours()).padStart(2, '0')}:${String(
      current.getMinutes()
    ).padStart(2, '0')}`;
  };

  const initialSubjectId = useMemo(
    () => user?.employeeId || user?.id,
    [user?.employeeId, user?.id]
  );
  const [resolvedEmployeeId, setResolvedEmployeeId] =
    useState(initialSubjectId);
  const today = todayStr();

  useEffect(() => {
    if (user?.employeeId && user.employeeId !== resolvedEmployeeId) {
      setResolvedEmployeeId(user.employeeId);
    }
  }, [user?.employeeId, resolvedEmployeeId]);

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
    if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
      toast.error('Already timed in today. Use Time Out.');
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

  return (
    <div
      className={cn(
        'w-full border rounded-2xl shadow-lg bg-gradient-to-br from-white to-blue-50 p-4 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-semibold">Today's Attendance</h3>
        {todayRecord?.status && (
          <Badge variant="outline" className="text-xs py-0.5 px-2">
            {todayRecord.status}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-3">
        <Button
          size="xs"
          className="bg-green-600 text-white hover:bg-green-500 w-full h-10 px-6 rounded-full justify-center"
          onClick={handleTimeIn}
        >
          <LogIn className="h-4 w-4 mr-2" /> Time In
        </Button>
        <Button
          size="xs"
          className="bg-red-600 text-white hover:bg-red-500 w-full h-10 px-6 rounded-full justify-center"
          onClick={handleTimeOut}
        >
          <LogOut className="h-4 w-4 mr-2" /> Time Out
        </Button>
      </div>

      <div className="text-sm space-y-1 mt-4">
        <div>Checked in: {todayRecord?.checkIn || '-'}</div>
        <div>Checked out: {todayRecord?.checkOut || '-'}</div>
      </div>
    </div>
  );
};

export default AttendanceTimeCard;
