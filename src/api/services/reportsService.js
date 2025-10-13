import apiClient from '../client';

const envFlags =
  (typeof import.meta !== 'undefined' && import.meta.env) || undefined;
const mocksFlag = envFlags?.VITE_ENABLE_MOCKS
  ? String(envFlags.VITE_ENABLE_MOCKS).toLowerCase()
  : '';
const USE_MOCKS = ['true', '1', 'yes'].includes(mocksFlag);

function normalizeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

class ReportsService {
  async getSalesReport(range = '30d') {
    if (!USE_MOCKS) {
      const params = new URLSearchParams();
      if (range) params.set('range', range);
      const endpoint = params.toString()
        ? `/reports/sales?${params.toString()}`
        : '/reports/sales';
      const res = await apiClient.get(endpoint, {
        retry: { retries: 1 },
      });
      const payload = res?.data?.data || res?.data || res || {};
      const series = Array.isArray(payload.series)
        ? payload.series
            .filter((row) => row?.t)
            .map((row) => ({
              t: row.t,
              y: normalizeNumber(row.y ?? row.total),
              count: Number(row.count || 0),
              label: row.label || null,
            }))
        : Array.isArray(payload.dailyTotals)
          ? payload.dailyTotals
              .filter((row) => row?.date)
              .map((row) => ({
                t: row.date,
                y: normalizeNumber(row.total),
                count: Number(row.count || 0),
                label: null,
              }))
          : [];
      const monthlyTotals = Array.isArray(payload.monthlyTotals)
        ? payload.monthlyTotals
            .filter((row) => row?.t || row?.month)
            .map((row) => ({
              t: row.t || row.month,
              y: normalizeNumber(row.y ?? row.total),
              count: Number(row.count || 0),
            }))
        : [];
      const byMethod = Array.isArray(payload.byMethod)
        ? payload.byMethod.map((row) => ({
            method: row.method || 'unknown',
            label: row.label || row.method || 'unknown',
            total: normalizeNumber(row.total),
            count: Number(row.count || 0),
          }))
        : [];
      return {
        totalRevenue: normalizeNumber(payload.totalRevenue),
        totalTransactions: Number(payload.totalTransactions || 0),
        totalOrders: Number(payload.totalOrders || 0),
        averageOrderValue: normalizeNumber(payload.averageOrderValue),
        range: payload.range || payload.timeRange || null,
        granularity: payload.granularity || null,
        series,
        byMethod,
        monthlyTotals,
      };
    }

    return {
      totalRevenue: 0,
      totalTransactions: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      range: null,
      byMethod: [],
      series: [],
      monthlyTotals: [],
    };
  }

  async getInventoryReport() {
    if (!USE_MOCKS) {
      const res = await apiClient.get('/reports/inventory', {
        retry: { retries: 1 },
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      return list.map((item) => ({
        id: item.id,
        name: item.name || '',
        category: item.category || '',
        quantity: normalizeNumber(item.quantity),
        unit: item.unit || '',
        minStock: normalizeNumber(item.minStock),
      }));
    }
    return [];
  }

  async getOrdersReport() {
    if (!USE_MOCKS) {
      const res = await apiClient.get('/reports/orders', {
        retry: { retries: 1 },
      });
      const payload = res?.data && typeof res.data === 'object' ? res.data : {};
      const entries = Object.entries(payload).map(([status, count]) => ({
        status: status || 'unknown',
        count: Number(count || 0),
      }));
      const total = entries.reduce((sum, entry) => sum + entry.count, 0);
      return {
        total,
        byStatus: entries,
      };
    }
    return {
      total: 0,
      byStatus: [],
    };
  }

  async getStaffAttendanceReport() {
    if (!USE_MOCKS) {
      const res = await apiClient.get('/reports/staff-attendance', {
        retry: { retries: 1 },
      });
      const payload = res?.data && typeof res.data === 'object' ? res.data : {};
      const entries = Object.entries(payload).map(([status, count]) => ({
        status: status || 'unknown',
        count: Number(count || 0),
      }));
      const total = entries.reduce((sum, entry) => sum + entry.count, 0);
      return {
        total,
        byStatus: entries,
      };
    }
    return {
      total: 0,
      byStatus: [],
    };
  }

  async getCustomerHistory(params = {}) {
    if (!USE_MOCKS) {
      const search = new URLSearchParams();
      const customer = (params.customer || '').trim();
      if (customer) search.set('customer', customer);
      const endpoint = search.toString()
        ? `/reports/customer-history?${search.toString()}`
        : '/reports/customer-history';
      const res = await apiClient.get(endpoint, {
        retry: { retries: 1 },
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      return list.map((item) => ({
        id: item.id,
        orderId: item.orderId || '',
        orderNumber:
          item.orderNumber ||
          item.order_number ||
          (item.meta && item.meta.orderNumber) ||
          '',
        amount: normalizeNumber(item.amount),
        method: item.method || 'unknown',
        status: item.status || '',
        date: item.date || null,
        reference: item.reference || '',
        customer: item.customer || '',
      }));
    }
    return [];
  }
}

export const reportsService = new ReportsService();
export default reportsService;
