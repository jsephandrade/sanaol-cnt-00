import apiClient from '../client';

const USE_MOCKS = !(
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  (import.meta.env.VITE_ENABLE_MOCKS === 'false' ||
    import.meta.env.VITE_ENABLE_MOCKS === '0')
);

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
      const payload = res?.data || res || {};
      return {
        totalRevenue: normalizeNumber(payload.totalRevenue),
        totalTransactions: Number(payload.totalTransactions || 0),
        totalOrders: Number(payload.totalOrders || 0),
        averageOrderValue: normalizeNumber(payload.averageOrderValue),
        range: payload.range || null,
        byMethod: Array.isArray(payload.byMethod)
          ? payload.byMethod.map((row) => ({
              method: row.method || 'unknown',
              total: normalizeNumber(row.total),
              count: Number(row.count || 0),
            }))
          : [],
        dailyTotals: Array.isArray(payload.dailyTotals)
          ? payload.dailyTotals
              .filter((row) => row?.date)
              .map((row) => ({
                date: row.date,
                total: normalizeNumber(row.total),
                count: Number(row.count || 0),
              }))
          : [],
        monthlyTotals: Array.isArray(payload.monthlyTotals)
          ? payload.monthlyTotals
              .filter((row) => row?.month)
              .map((row) => ({
                month: row.month,
                total: normalizeNumber(row.total),
                count: Number(row.count || 0),
              }))
          : [],
      };
    }

    return {
      totalRevenue: 0,
      totalTransactions: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      range: null,
      byMethod: [],
      dailyTotals: [],
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
