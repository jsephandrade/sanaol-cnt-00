import { useCallback, useEffect, useState } from 'react';
import { employeeService } from '@/api/services/employeeService';
import { toast } from 'sonner';

const EMPTY_OVERVIEW = Object.freeze({
  totals: {
    shifts: 0,
    uniqueEmployees: 0,
    totalHours: 0,
    avgHoursPerShift: 0,
    utilizationScore: 0,
  },
  days: [],
  alerts: [],
  topContributors: [],
});

export const useScheduleOverview = (initialParams = {}, options = {}) => {
  const { autoFetch = true, suppressErrorToast = false } = options || {};
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams || {});

  const fetchOverview = useCallback(
    async (override = null) => {
      try {
        setLoading(true);
        setError(null);
        const data =
          (await employeeService.getScheduleOverview(override || params)) ||
          EMPTY_OVERVIEW;
        setOverview({
          totals: {
            shifts: Number(data?.totals?.shifts ?? 0),
            uniqueEmployees: Number(data?.totals?.uniqueEmployees ?? 0),
            totalHours: Number(data?.totals?.totalHours ?? 0),
            avgHoursPerShift: Number(data?.totals?.avgHoursPerShift ?? 0),
            utilizationScore: Number(data?.totals?.utilizationScore ?? 0),
          },
          days: Array.isArray(data?.days) ? data.days : [],
          alerts: Array.isArray(data?.alerts) ? data.alerts : [],
          topContributors: Array.isArray(data?.topContributors)
            ? data.topContributors
            : [],
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load schedule insights';
        setError(errorMessage);
        if (!suppressErrorToast) toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [params, suppressErrorToast]
  );

  useEffect(() => {
    if (autoFetch) fetchOverview();
  }, [autoFetch, fetchOverview]);

  return {
    overview,
    loading,
    error,
    params,
    setParams,
    refetch: fetchOverview,
  };
};

export default useScheduleOverview;
