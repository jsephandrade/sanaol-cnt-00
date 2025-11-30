import apiClient from '../client';
import { getEnvBoolean } from '../env';

const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const USE_MOCKS = getEnvBoolean('VITE_ENABLE_MOCKS', true);

const mapRecord = (r = {}) => ({
  id: r.id,
  employeeId: r.employeeId,
  employeeName: r.employeeName || '',
  date: r.date,
  checkIn: r.checkIn || null,
  checkOut: r.checkOut || null,
  status: r.status || 'present',
  notes: r.notes || '',
});

// Local fallback store for staff when API forbids attendance endpoints
const FALLBACK_KEY = 'attendance:fallback:records';
const fallbackAttendanceStore = [];
const nextFallbackId = () =>
  `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadFallbackFromStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(FALLBACK_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      fallbackAttendanceStore.splice(
        0,
        fallbackAttendanceStore.length,
        ...parsed
      );
    }
  } catch {
    // ignore storage failures
  }
};

const persistFallbackToStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      FALLBACK_KEY,
      JSON.stringify(fallbackAttendanceStore)
    );
  } catch {
    // ignore storage failures
  }
};

loadFallbackFromStorage();

const readFallbackRecords = (params = {}) => {
  const { employeeId } = params || {};
  if (!employeeId) return [...fallbackAttendanceStore];
  return fallbackAttendanceStore.filter(
    (r) => r.employeeId && String(r.employeeId) === String(employeeId)
  );
};

const hasFallbackRecordForDay = (employeeId, date) =>
  fallbackAttendanceStore.some(
    (r) => String(r.employeeId) === String(employeeId) && r.date === date
  );

let attendanceEndpointsCache = {
  selfList: null,
  selfCreate: null,
  selfUpdate: null,
};

class AttendanceService {
  // Attendance
  async getAttendance(params = {}) {
    if (!USE_MOCKS) {
      try {
        const qs = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '')
            qs.append(k, String(v));
        });
        const res = await apiClient.get(`/attendance?${qs.toString()}`, {
          retry: { retries: 2 },
        });
        const list = Array.isArray(res) ? res : res?.data || [];
        const mapped = list.map(mapRecord);
        const fallback = readFallbackRecords(params).map(mapRecord);
        if (!fallback.length) return mapped;
        const seen = new Set(
          mapped.map((r) => `${String(r.employeeId || '')}:${r.date || ''}`)
        );
        fallback.forEach((r) => {
          const key = `${String(r.employeeId || '')}:${r.date || ''}`;
          if (!seen.has(key)) {
            mapped.push(r);
          }
        });
        return mapped;
      } catch (e) {
        // For staff roles, some backends restrict query by employeeId; retry self-only endpoints
        if (e?.status === 403 || e?.status === 404) {
          const fallbackEndpoints = attendanceEndpointsCache.selfList || [
            '/attendance/me',
            '/attendance/self',
          ];
          for (const endpoint of fallbackEndpoints) {
            try {
              const res = await apiClient.get(endpoint, {
                retry: { retries: 1 },
              });
              const list = Array.isArray(res) ? res : res?.data || [];
              attendanceEndpointsCache.selfList = [endpoint];
              return list.map(mapRecord);
            } catch (innerErr) {
              if (innerErr?.status === 404) {
                continue;
              }
              if (innerErr?.status && innerErr.status !== 403) {
                console.warn(
                  `getAttendance fallback ${endpoint} failed:`,
                  innerErr?.message
                );
              }
              continue;
            }
          }
        }
        console.warn('getAttendance API failed:', e?.message);
        if (e?.status === 403 || e?.status === 404) {
          return readFallbackRecords(params).map(mapRecord);
        }
        throw e;
      }
    }
    await mockDelay();
    return readFallbackRecords(params);
  }

  async createAttendance(payload) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/attendance', payload, {
          retry: { retries: 1 },
        });
        return mapRecord(res?.data || res);
      } catch (e) {
        if (e?.status === 403 || e?.status === 404) {
          const fallbackEndpoints = attendanceEndpointsCache.selfCreate || [
            '/attendance/me',
            '/attendance/self',
          ];
          for (const endpoint of fallbackEndpoints) {
            try {
              const res = await apiClient.post(endpoint, payload, {
                retry: { retries: 1 },
              });
              attendanceEndpointsCache.selfCreate = [endpoint];
              return mapRecord(res?.data || res);
            } catch (innerErr) {
              if (innerErr?.status === 404) {
                continue;
              }
              if (innerErr?.status && innerErr.status !== 403) {
                console.warn(
                  `createAttendance fallback ${endpoint} failed:`,
                  innerErr?.message
                );
              }
              continue;
            }
          }
        }
        if (e?.status === 403 || e?.status === 404) {
          if (hasFallbackRecordForDay(payload.employeeId, payload.date)) {
            throw new Error('Daily record already exists for today.');
          }
          const record = mapRecord({
            ...payload,
            id: nextFallbackId(),
          });
          fallbackAttendanceStore.unshift(record);
          persistFallbackToStorage();
          return record;
        }
        throw e;
      }
    }
    await mockDelay(200);
    if (hasFallbackRecordForDay(payload.employeeId, payload.date)) {
      throw new Error('Daily record already exists for today.');
    }
    const record = mapRecord({ ...payload, id: nextFallbackId() });
    fallbackAttendanceStore.unshift(record);
    persistFallbackToStorage();
    return record;
  }

  async updateAttendance(id, updates) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.put(`/attendance/${id}`, updates, {
          retry: { retries: 1 },
        });
        return mapRecord(res?.data || res);
      } catch (e) {
        if (e?.status === 403 || e?.status === 404) {
          const fallbackEndpoints = attendanceEndpointsCache.selfUpdate || [
            `/attendance/self/${id}`,
            `/attendance/${id}/self`,
            '/attendance/me',
          ];
          for (const endpoint of fallbackEndpoints) {
            try {
              const res = await apiClient.put(endpoint, updates, {
                retry: { retries: 1 },
              });
              attendanceEndpointsCache.selfUpdate = [endpoint];
              return mapRecord(res?.data || res);
            } catch (innerErr) {
              if (innerErr?.status === 404) {
                continue;
              }
              if (innerErr?.status && innerErr.status !== 403) {
                console.warn(
                  `updateAttendance fallback ${endpoint} failed:`,
                  innerErr?.message
                );
              }
              continue;
            }
          }
        }
        if (e?.status === 403 || e?.status === 404) {
          const idx = fallbackAttendanceStore.findIndex((r) => r.id === id);
          if (idx !== -1) {
            fallbackAttendanceStore[idx] = {
              ...fallbackAttendanceStore[idx],
              ...updates,
            };
            persistFallbackToStorage();
            return mapRecord(fallbackAttendanceStore[idx]);
          }
          const synthesized = mapRecord({ ...updates, id });
          fallbackAttendanceStore.unshift(synthesized);
          persistFallbackToStorage();
          return synthesized;
        }
        throw e;
      }
    }
    await mockDelay(150);
    const idx = fallbackAttendanceStore.findIndex((r) => r.id === id);
    if (idx !== -1) {
      fallbackAttendanceStore[idx] = {
        ...fallbackAttendanceStore[idx],
        ...updates,
      };
      persistFallbackToStorage();
      return mapRecord(fallbackAttendanceStore[idx]);
    }
    const synthesized = mapRecord({ ...updates, id });
    fallbackAttendanceStore.unshift(synthesized);
    persistFallbackToStorage();
    return synthesized;
  }

  async deleteAttendance(id) {
    if (!USE_MOCKS) {
      await apiClient.delete(`/attendance/${id}`, { retry: { retries: 1 } });
      const idx = fallbackAttendanceStore.findIndex((r) => r.id === id);
      if (idx !== -1) {
        fallbackAttendanceStore.splice(idx, 1);
        persistFallbackToStorage();
      }
      return true;
    }
    await mockDelay(120);
    const idx = fallbackAttendanceStore.findIndex((r) => r.id === id);
    if (idx !== -1) {
      fallbackAttendanceStore.splice(idx, 1);
      persistFallbackToStorage();
    }
    return true;
  }

  // Leave
  async getLeaves(params = {}) {
    if (!USE_MOCKS) {
      try {
        const qs = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '')
            qs.append(k, String(v));
        });
        const res = await apiClient.get(`/leaves?${qs.toString()}`, {
          retry: { retries: 2 },
        });
        const list = Array.isArray(res) ? res : res?.data || [];
        return list.map((l) => ({
          id: l.id,
          employeeId: l.employeeId,
          employeeName: l.employeeName || '',
          startDate: l.startDate,
          endDate: l.endDate,
          type: l.type || 'other',
          status: l.status || 'pending',
          reason: l.reason || '',
          decidedBy: l.decidedBy || '',
          decidedAt: l.decidedAt || null,
        }));
      } catch (e) {
        console.warn('getLeaves API failed:', e?.message);
      }
    }
    await mockDelay();
    return [];
  }

  async createLeave(payload) {
    if (!USE_MOCKS) {
      const res = await apiClient.post('/leaves', payload, {
        retry: { retries: 1 },
      });
      const l = res?.data || res;
      return {
        id: l.id,
        employeeId: l.employeeId,
        employeeName: l.employeeName || '',
        startDate: l.startDate,
        endDate: l.endDate,
        type: l.type || 'other',
        status: l.status || 'pending',
        reason: l.reason || '',
        decidedBy: l.decidedBy || '',
        decidedAt: l.decidedAt || null,
      };
    }
    await mockDelay(200);
    return { id: Date.now().toString(), ...payload };
  }

  async updateLeave(id, updates) {
    if (!USE_MOCKS) {
      const res = await apiClient.put(`/leaves/${id}`, updates, {
        retry: { retries: 1 },
      });
      const l = res?.data || res;
      return {
        id: l.id,
        employeeId: l.employeeId,
        employeeName: l.employeeName || '',
        startDate: l.startDate,
        endDate: l.endDate,
        type: l.type || 'other',
        status: l.status || 'pending',
        reason: l.reason || '',
        decidedBy: l.decidedBy || '',
        decidedAt: l.decidedAt || null,
      };
    }
    await mockDelay(150);
    return { id, ...updates };
  }

  async deleteLeave(id) {
    if (!USE_MOCKS) {
      await apiClient.delete(`/leaves/${id}`, { retry: { retries: 1 } });
      return true;
    }
    await mockDelay(120);
    return true;
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
