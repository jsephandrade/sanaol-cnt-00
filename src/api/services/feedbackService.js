import apiClient from '../client';
import { mockFeedback } from '../mockData';

const mockDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const USE_MOCKS = !(
  typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_ENABLE_MOCKS === 'false' || import.meta.env.VITE_ENABLE_MOCKS === '0')
);

class FeedbackService {
  async getFeedback(params = {}) {
    if (!USE_MOCKS) {
      try {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
        });
        const res = await apiClient.get(`/feedback?${qs.toString()}`, { retry: { retries: 1 } });
        return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      } catch (e) {
        console.warn('getFeedback API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(200);
    return mockFeedback;
  }

  async markFeedbackResolved(id) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.patch(`/feedback/${id}`, { resolved: true }, { retry: { retries: 1 } });
        return res?.data || res;
      } catch (e) {
        console.warn('markFeedbackResolved API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(150);
    const item = mockFeedback.find((f) => f.id === id);
    if (!item) throw new Error('Feedback not found');
    return { ...item, resolved: !item.resolved };
  }

  async updateFeedback(id, updates) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.put(`/feedback/${id}`, updates, { retry: { retries: 1 } });
        return res?.data || res;
      } catch (e) {
        console.warn('updateFeedback API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(150);
    const item = mockFeedback.find((f) => f.id === id);
    if (!item) throw new Error('Feedback not found');
    return { ...item, ...updates };
  }

  async createFeedback(data) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/feedback', data, { retry: { retries: 1 } });
        return res?.data || res;
      } catch (e) {
        console.warn('createFeedback API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(150);
    return { id: Date.now().toString(), ...data, createdAt: new Date().toISOString(), resolved: false };
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;

