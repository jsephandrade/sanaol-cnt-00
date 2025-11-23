import { useEffect, useState, useCallback } from 'react';
import { attendanceService } from '@/api/services/attendanceService';
import { toast } from 'sonner';

const shallowEqual = (a = {}, b = {}) => {
  const aKeys = Object.keys(a || {});
  const bKeys = Object.keys(b || {});
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => {
    const aVal = a?.[key];
    const bVal = b?.[key];
    if (aVal === bVal) return true;
    if (
      typeof aVal === 'object' &&
      aVal !== null &&
      typeof bVal === 'object' &&
      bVal !== null
    ) {
      return shallowEqual(aVal, bVal);
    }
    return false;
  });
};

const cloneParams = (value) => {
  if (!value || typeof value !== 'object') return {};
  return { ...value };
};

export function useAttendance(initialParams = {}, options = {}) {
  const {
    autoFetch = true,
    suppressErrorToast = false,
    watchInitialParams = true,
    enforceSelfOnly = true,
    onAuthError,
  } = options || {};

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);
  const [params, setParams] = useState(() => cloneParams(initialParams));

  const updateParams = useCallback((updater) => {
    setParams((prev) => {
      const nextValue =
        typeof updater === 'function'
          ? cloneParams(updater(prev || {}))
          : cloneParams(updater);
      if (shallowEqual(prev || {}, nextValue || {})) return prev || {};
      return nextValue;
    });
  }, []);

  useEffect(() => {
    if (!watchInitialParams) return;
    updateParams(initialParams || {});
  }, [initialParams, watchInitialParams, updateParams]);

  const fetchRecords = useCallback(
    async (override = null) => {
      const baseQuery = override ?? params;
      const query =
        enforceSelfOnly && baseQuery?.employeeId
          ? { employeeId: baseQuery.employeeId }
          : baseQuery;
      try {
        setLoading(true);
        setError(null);
        const res = await attendanceService.getAttendance(query);
        setRecords(res || []);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to load attendance';
        setError(msg);
        if (err?.status === 401 && typeof onAuthError === 'function') {
          onAuthError(err);
        }
        if (!suppressErrorToast) toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [params, suppressErrorToast, enforceSelfOnly, onAuthError]
  );

  useEffect(() => {
    if (!autoFetch) return;
    fetchRecords();
  }, [fetchRecords, autoFetch]);

  const createRecord = async (payload) => {
    const created = await attendanceService.createAttendance(payload);
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.id !== created.id);
      return [created, ...filtered];
    });
    return created;
  };
  const updateRecord = async (id, updates) => {
    const updated = await attendanceService.updateAttendance(id, updates);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };
  const deleteRecord = async (id) => {
    await attendanceService.deleteAttendance(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    records,
    loading,
    error,
    params,
    setParams: updateParams,
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
