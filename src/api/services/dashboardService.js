import apiClient from '../client';
import { mockDashboardStats } from '../mockData';

const envFlags =
  (typeof import.meta !== 'undefined' && import.meta.env) || undefined;
const mocksFlag = envFlags?.VITE_ENABLE_MOCKS
  ? String(envFlags.VITE_ENABLE_MOCKS).toLowerCase()
  : '';
const USE_MOCKS = ['true', '1', 'yes'].includes(mocksFlag);

// Mock delay for realistic API simulation
const mockDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const EMPTY_OVERVIEW = {
  timeRange: null,
  granularity: null,
  maxPoints: null,
  dailySales: 0,
  monthlySales: 0,
  monthlyExpenses: 0,
  orderCount: 0,
  customerCount: 0,
  salesByTime: [],
  salesByCategory: [],
  popularItems: [],
  recentSales: [],
};

function normalizeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeOverview(raw = {}) {
  const source =
    raw && typeof raw === 'object'
      ? typeof raw.data === 'object' && raw.data !== null
        ? raw.data
        : raw
      : {};

  const result = {
    ...EMPTY_OVERVIEW,
    timeRange: source.timeRange || null,
    granularity: source.granularity || source.timeRange?.granularity || null,
    maxPoints: source.maxPoints || null,
    dailySales: normalizeNumber(source.dailySales),
    monthlySales: normalizeNumber(source.monthlySales),
    monthlyExpenses: normalizeNumber(source.monthlyExpenses),
    orderCount: Number(source.orderCount || 0),
    customerCount: Number(source.customerCount || 0),
    salesByTime: Array.isArray(source.salesByTime)
      ? source.salesByTime
          .filter((row) => row && (row.t || row.time || row.name))
          .map((row) => ({
            t: row.t || row.time || row.name,
            y: normalizeNumber(row.y ?? row.amount),
            count: Number(row.count || 0),
            label: row.label || row.time || row.name || null,
          }))
      : [],
    salesByCategory: Array.isArray(source.salesByCategory)
      ? source.salesByCategory.map((row) => ({
          label: row.label || row.category || row.name || 'Uncategorized',
          category: row.category || row.name || 'Uncategorized',
          value: normalizeNumber(row.value ?? row.amount),
        }))
      : [],
    popularItems: Array.isArray(source.popularItems)
      ? source.popularItems.map((row) => ({
          name: row.name || 'Menu Item',
          count: Number(row.count || row.quantity || 0),
          value: Number(row.value || row.count || row.quantity || 0),
        }))
      : [],
    recentSales: Array.isArray(source.recentSales)
      ? source.recentSales.map((row) => ({
          id: row.orderNumber || row.id || '',
          orderNumber: row.orderNumber || row.id || '',
          total: normalizeNumber(row.total),
          date: row.date || null,
          paymentMethod: row.paymentMethod || '',
          customer: row.customer || '',
        }))
      : [],
  };

  return result;
}

class DashboardService {
  async _fetchOverview(range = 'today') {
    if (USE_MOCKS) {
      await mockDelay();
      return normalizeOverview(mockDashboardStats);
    }

    const params = new URLSearchParams();
    if (range) params.set('range', range);
    const endpoint = params.toString()
      ? `/dashboard/overview?${params.toString()}`
      : '/dashboard/overview';

    const res = await apiClient.get(endpoint, {
      retry: { retries: 1 },
    });
    return normalizeOverview(res);
  }

  async getDashboardStats(_timeRange = 'today') {
    try {
      const data = await this._fetchOverview(_timeRange);
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async getSalesData(_params = {}) {
    const range = _params.range || _params.timeRange || 'today';
    try {
      const data = await this._fetchOverview(range);
      return {
        success: true,
        data: data.salesByTime,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error,
      };
    }
  }

  async getRecentActivity(limit = 10) {
    try {
      const data = await this._fetchOverview('today');
      return {
        success: true,
        data: data.recentSales.slice(0, limit),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error,
      };
    }
  }

  async getPopularItems(_timeRange = 'week') {
    const range = _timeRange || 'today';
    try {
      const data = await this._fetchOverview(range);
      return {
        success: true,
        data: data.popularItems,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error,
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
