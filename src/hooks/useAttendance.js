import { useEffect, useState, useCallback } from 'react';
import { attendanceService } from '@/api/services/attendanceService';
import { toast } from 'sonner';

export function useAttendance(initialParams = {}, options = {}) {
  const { autoFetch = true, enabled = true } = options || {};
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(autoFetch && enabled));
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchRecords = useCallback(
    async (override = null) => {
      if (!enabled) {
        setLoading(false);
        setRecords([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await attendanceService.getAttendance(override || params);
        setRecords(res || []);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to load attendance';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [params, enabled]
  );

  useEffect(() => {
    if (autoFetch && enabled) {
      fetchRecords();
    } else if (!enabled) {
      setLoading(false);
    }
  }, [fetchRecords, autoFetch, enabled]);

  const createRecord = async (payload) => {
    if (!enabled) {
      throw new Error('Attendance tracking is not available for this user.');
    }
    const created = await attendanceService.createAttendance(payload);
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.id !== created.id);
      return [created, ...filtered];
    });
    return created;
  };
  const updateRecord = async (id, updates) => {
    if (!enabled) {
      throw new Error('Attendance tracking is not available for this user.');
    }
    const updated = await attendanceService.updateAttendance(id, updates);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };
  const deleteRecord = async (id) => {
    if (!enabled) {
      throw new Error('Attendance tracking is not available for this user.');
    }
    await attendanceService.deleteAttendance(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    records,
    loading,
    error,
    params,
    setParams,
    refetch: fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}

export function useLeaves(initialParams = {}, options = {}) {
  const { autoFetch = true, suppressErrorToast = false } = options || {};
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchRecords = useCallback(
    async (override = null) => {
      try {
        setLoading(true);
        setError(null);
        const res = await attendanceService.getLeaves(override || params);
        setRecords(res || []);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to load leave records';
        setError(msg);
        if (!suppressErrorToast) toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [params, suppressErrorToast]
  );

  useEffect(() => {
    if (autoFetch) fetchRecords();
  }, [fetchRecords, autoFetch]);

  const createRecord = async (payload) => {
    const created = await attendanceService.createLeave(payload);
    setRecords((prev) => [created, ...prev]);
    return created;
  };
  const updateRecord = async (id, updates) => {
    const updated = await attendanceService.updateLeave(id, updates);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };
  const deleteRecord = async (id) => {
    await attendanceService.deleteLeave(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    records,
    loading,
    error,
    params,
    setParams,
    refetch: fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
