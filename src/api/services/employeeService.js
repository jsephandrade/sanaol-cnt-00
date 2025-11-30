import apiClient from '../client';

class EmployeeService {
  async getEmployees(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const res = await apiClient.get(`/employees?${qs.toString()}`, {
      retry: { retries: 2 },
    });
    // Backend returns { success, data }
    const list = Array.isArray(res) ? res : res?.data || [];
    return list.map((e) => ({
      id: e.id,
      name: e.name,
      userId: e.userId || null,
      userName: e.userName || '',
      userEmail: e.userEmail || '',
      userRole: e.userRole || '',
      userStatus: e.userStatus || '',
      position: e.position || '',
      hourlyRate: Number(e.hourlyRate ?? 0),
      contact: e.contact || '',
      status: e.status || 'active',
      avatar: e.avatar || '/placeholder.svg',
    }));
  }

  async createEmployee(employee) {
    const payload = {
      name: employee?.name || '',
      userId: employee?.userId || employee?.user || null,
      position: employee?.position || '',
      hourlyRate: Number(employee?.hourlyRate ?? 0),
      contact: employee?.contact || '',
      status: employee?.status || 'active',
    };
    const res = await apiClient.post('/employees', payload, {
      retry: { retries: 1 },
    });
    const e = res?.data || res;
    return {
      id: e.id,
      name: e.name,
      userId: e.userId || null,
      userName: e.userName || '',
      userEmail: e.userEmail || '',
      userRole: e.userRole || '',
      userStatus: e.userStatus || '',
      position: e.position || '',
      hourlyRate: Number(e.hourlyRate ?? 0),
      contact: e.contact || '',
      status: e.status || 'active',
      avatar: e.avatar || '/placeholder.svg',
    };
  }

  async updateEmployee(id, updates) {
    const payload = { ...updates };
    const res = await apiClient.put(`/employees/${id}`, payload, {
      retry: { retries: 1 },
    });
    const e = res?.data || res;
    return {
      id: e.id,
      name: e.name,
      userId: e.userId || null,
      userName: e.userName || '',
      userEmail: e.userEmail || '',
      userRole: e.userRole || '',
      userStatus: e.userStatus || '',
      position: e.position || '',
      hourlyRate: Number(e.hourlyRate ?? 0),
      contact: e.contact || '',
      status: e.status || 'active',
      avatar: e.avatar || '/placeholder.svg',
    };
  }

  async deleteEmployee(id) {
    await apiClient.delete(`/employees/${id}`, { retry: { retries: 1 } });
    return true;
  }

  async getSchedule(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const res = await apiClient.get(`/schedule?${qs.toString()}`, {
      retry: { retries: 2 },
    });
    const list = Array.isArray(res) ? res : res?.data || [];
    return list.map((s) => ({
      id: s.id,
      employeeId: s.employeeId,
      employeeName: s.employeeName || '',
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  }

  async createSchedule(entry) {
    const payload = {
      employeeId: entry?.employeeId,
      day: entry?.day,
      startTime: entry?.startTime,
      endTime: entry?.endTime,
    };
    const res = await apiClient.post('/schedule', payload, {
      retry: { retries: 1 },
    });
    const s = res?.data || res;
    return {
      id: s.id,
      employeeId: s.employeeId,
      employeeName: s.employeeName || '',
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  }

  async updateSchedule(id, updates) {
    const res = await apiClient.put(`/schedule/${id}`, updates, {
      retry: { retries: 1 },
    });
    const s = res?.data || res;
    return {
      id: s.id,
      employeeId: s.employeeId,
      employeeName: s.employeeName || '',
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  }

  async deleteSchedule(id) {
    await apiClient.delete(`/schedule/${id}`, { retry: { retries: 1 } });
    return true;
  }

  async getScheduleOverview(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qs.append(key, String(value));
      }
    });
    const query = qs.toString();
    const url = query ? `/schedule/overview?${query}` : '/schedule/overview';
    const res = await apiClient.get(url, {
      retry: { retries: 1 },
    });
    const payload = res?.data || res || {};
    const totals = payload?.totals || {};

    const serializeDays = Array.isArray(payload?.days)
      ? payload.days.map((day) => ({
          day: day?.day || '',
          shifts: Number(day?.shifts ?? 0),
          totalHours: Number(day?.totalHours ?? 0),
          earliestStart: day?.earliestStart || null,
          latestEnd: day?.latestEnd || null,
          coverageRating: day?.coverageRating || 'none',
        }))
      : [];

    const serializeAlerts = Array.isArray(payload?.alerts)
      ? payload.alerts.map((alert) => ({
          day: alert?.day || '',
          message: alert?.message || '',
          severity: alert?.severity || 'warning',
          shifts: Number(alert?.shifts ?? 0),
        }))
      : [];

    const serializeContributors = Array.isArray(payload?.topContributors)
      ? payload.topContributors.map((entry) => ({
          employeeId: entry?.employeeId,
          employeeName: entry?.employeeName || '',
          shifts: Number(entry?.shifts ?? 0),
          totalHours: Number(entry?.totalHours ?? 0),
        }))
      : [];

    return {
      totals: {
        shifts: Number(totals?.shifts ?? 0),
        uniqueEmployees: Number(totals?.uniqueEmployees ?? 0),
        totalHours: Number(totals?.totalHours ?? 0),
        avgHoursPerShift: Number(totals?.avgHoursPerShift ?? 0),
        utilizationScore: Number(totals?.utilizationScore ?? 0),
      },
      days: serializeDays,
      alerts: serializeAlerts,
      topContributors: serializeContributors,
    };
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
