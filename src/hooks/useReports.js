import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { reportsService } from '@/api/services/reportsService';

export function useSalesReport(initialRange = '30d', options = {}) {
  const { autoFetch = true } = options;
  const [data, setData] = useState(null);
  const [range, setRange] = useState(initialRange);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);

  const fetchReport = useCallback(
    async (targetRange = range) => {
      try {
        setLoading(true);
        setError(null);
        const result = await reportsService.getSalesReport(targetRange);
        setData(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load sales report';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [range]
  );

  useEffect(() => {
    if (!autoFetch) return;
    fetchReport(range).catch(() => {});
  }, [autoFetch, fetchReport, range]);

  return {
    data,
    loading,
    error,
    range,
    setRange,
    refresh: fetchReport,
  };
}

export function useInventoryReport(options = {}) {
  const { autoFetch = true } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsService.getInventoryReport();
      setData(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load inventory report';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    fetchReport().catch(() => {});
  }, [autoFetch, fetchReport]);

  return {
    data,
    loading,
    error,
    refresh: fetchReport,
  };
}

export function useOrdersReport(options = {}) {
  const { autoFetch = true } = options;
  const [data, setData] = useState({ total: 0, byStatus: [] });
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsService.getOrdersReport();
      setData(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load orders report';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    fetchReport().catch(() => {});
  }, [autoFetch, fetchReport]);

  return {
    data,
    loading,
    error,
    refresh: fetchReport,
  };
}

export function useStaffAttendanceReport(options = {}) {
  const { autoFetch = true } = options;
  const [data, setData] = useState({ total: 0, byStatus: [] });
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsService.getStaffAttendanceReport();
      setData(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load attendance report';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    fetchReport().catch(() => {});
  }, [autoFetch, fetchReport]);

  return {
    data,
    loading,
    error,
    refresh: fetchReport,
  };
}

export function useCustomerHistory(initialFilters = {}, options = {}) {
  const { autoFetch = true } = options;
  const [filters, setFilters] = useState(initialFilters || {});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(autoFetch));
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(
    async (override = null) => {
      try {
        setLoading(true);
        setError(null);
        const activeFilters = override ?? filters;
        const result = await reportsService.getCustomerHistory(activeFilters);
        setData(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load customer purchases';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (!autoFetch) return;
    fetchHistory(filters).catch(() => {});
  }, [autoFetch, fetchHistory, filters]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchHistory,
  };
}

export default {
  useSalesReport,
  useInventoryReport,
  useOrdersReport,
  useStaffAttendanceReport,
  useCustomerHistory,
};
