import apiClient from '../client';
import { resolveApiBase } from '../env';

const toQuery = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') p.set(k, String(v));
  });
  return p.toString();
};

class PaymentsService {
  async list({
    search = '',
    status = '',
    method = '',
    timeRange = '24h',
    page = 1,
    limit = 100,
  } = {}) {
    const qs = toQuery({ search, status, method, timeRange, page, limit });
    const res = await apiClient.get(`/payments?${qs}`);
    return res?.data || [];
  }

  async refund(paymentId) {
    const res = await apiClient.post(
      `/payments/${encodeURIComponent(paymentId)}/refund`,
      {}
    );
    return res?.data;
  }

  async getConfig() {
    const res = await apiClient.get('/payments/config');
    return res?.data || { cash: true, card: true, mobile: true };
  }

  async updateConfig(payload = {}) {
    const res = await apiClient.put('/payments/config', payload);
    return !!(res && res.success);
  }

  async downloadInvoiceBlob(paymentId) {
    const baseCandidate =
      (typeof apiClient?.baseURL === 'string' && apiClient.baseURL) ||
      resolveApiBase('/api');
    const normalizedBase = (baseCandidate || '/api').replace(/\/+$/, '');
    const url = `${normalizedBase}/payments/${encodeURIComponent(
      paymentId
    )}/invoice`;
    const headers = { ...(apiClient.defaultHeaders || {}) };
    if (headers['Content-Type']) delete headers['Content-Type'];
    const resp = await fetch(url, {
      method: 'GET',
      headers,
      credentials: apiClient.sendCredentials ? 'include' : 'same-origin',
    });
    if (!resp.ok) throw new Error('Failed to download invoice');
    const blob = await resp.blob();
    return blob;
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
