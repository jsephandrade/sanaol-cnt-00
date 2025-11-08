import apiClient from './apiClient';
import { orderService } from '../../../shared/api';
import { getAccessToken, getSessionUser } from './session';

const DEFAULT_ACTIVE_STATUSES = [
  'new',
  'pending',
  'accepted',
  'in_queue',
  'in_prep',
  'assembling',
  'staged',
  'ready',
];

const DEFAULT_HISTORY_STATUSES = ['completed', 'cancelled', 'refunded'];

function ensureAuthenticated() {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }
}

function unwrap(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

function normalizeHistoryResult(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.orders)) return result.orders;
  if (Array.isArray(result.items)) return result.items;
  if (Array.isArray(result.data)) return result.data;
  if (result.data && Array.isArray(result.data.orders)) {
    return result.data.orders;
  }
  return [];
}

export async function fetchCurrentOrder(options = {}) {
  const token = getAccessToken();
  if (!token) return null;
  const params = {
    limit: 1,
    statuses: options.statuses || DEFAULT_ACTIVE_STATUSES.join(','),
  };
  try {
    const result = await orderService.getOrderQueue(params);
    const payload = unwrap(result) || {};
    const orders = Array.isArray(payload.orders) ? payload.orders : [];
    return orders.length > 0 ? orders[0] : null;
  } catch (error) {
    if (error?.status === 401) {
      throw new Error('Authentication required');
    }
    throw error;
  }
}

export async function fetchOrderHistory(options = {}) {
  const token = getAccessToken();
  if (!token) return [];
  const params = {
    limit: options.limit || 25,
    page: options.page || 1,
    statuses: options.statuses || DEFAULT_HISTORY_STATUSES.join(','),
  };
  try {
    const result = await orderService.getOrderHistory(params);
    const payload = unwrap(result) || result;
    return normalizeHistoryResult(payload);
  } catch (error) {
    if (error?.status === 401) {
      throw new Error('Authentication required');
    }
    throw error;
  }
}

export async function createSupportTicket(orderId, message) {
  ensureAuthenticated();
  const user = getSessionUser();
  const body = {
    title: `Support request for order ${orderId}`,
    message:
      message || `User ${user?.name || user?.email || 'unknown'} needs help with order ${orderId}.`,
    type: 'info',
  };
  const res = await apiClient.post('/notifications', body, {
    retry: { retries: 1 },
  });
  const data = unwrap(res) || {};
  const ticketId = data.id || `SUP-${Date.now()}`;
  return {
    orderId,
    ticketId,
    submittedAt: data.createdAt || new Date().toISOString(),
    status: 'submitted',
  };
}
