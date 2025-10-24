import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_CONFIG, BASE_URL } from './config';
import {
  mockCreatePayment,
  mockFetchInventory,
  mockFetchOrders,
  mockFetchPayments,
  mockGetCurrentUser,
  mockLogin,
  mockLoginWithGoogle,
  mockLogout,
  mockFetchMenuCategories,
  mockFetchMenuItems,
  mockRegisterAccount,
  mockRequestPasswordReset,
  mockUpdateInventoryItem,
  mockUpdateOrderStatus,
  mockUpdateProfile,
  mockRefundPayment,
  mockUploadAvatar,
} from './mockData';

export const ACCESS_TOKEN_KEY = '@sanaol/auth/accessToken';
export const REFRESH_TOKEN_KEY = '@sanaol/auth/refreshToken';
export const USER_CACHE_KEY = '@sanaol/auth/user';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
});

const authlessApi = axios.create({
  baseURL: BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;
let mockMode = API_CONFIG.useMocks;

const apiEventListeners = new Set();

function emitApiEvent(event) {
  apiEventListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (listenerError) {
      const isDev =
        typeof globalThis !== 'undefined' && Boolean(globalThis.__DEV__);
      if (isDev) {
        console.error('[api] event listener error', listenerError);
      }
    }
  });
}

export function subscribeToApiEvents(listener) {
  apiEventListeners.add(listener);
  return () => {
    apiEventListeners.delete(listener);
  };
}

export function isMockMode() {
  return mockMode;
}

export function setMockMode(nextValue) {
  mockMode = Boolean(nextValue);
  emitApiEvent({ type: 'mock-mode-changed', mockMode });
}

function isNetworkError(error) {
  if (!error) return false;
  if (axios.isAxiosError(error)) {
    if (!error.response) return true;
    if (error.code === 'ECONNABORTED') return true;
    if (
      typeof error.message === 'string' &&
      error.message.toLowerCase().includes('network')
    ) {
      return true;
    }
  }
  return false;
}

function unwrapPayload(response) {
  const payload = response?.data;
  if (!payload) return payload;
  if (payload.data !== undefined) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (payload.results !== undefined) return payload.results;
  return payload;
}

function extractMeta(response) {
  const payload = response?.data;
  if (payload?.meta) return payload.meta;
  const message = payload?.message;
  const success = payload?.success;
  if (message || success !== undefined) {
    return { message, success };
  }
  return undefined;
}

function createApiError(error, fallbackMessage = 'Request failed') {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message =
      payload?.meta?.message ||
      payload?.message ||
      payload?.detail ||
      fallbackMessage;
    const apiError = new Error(message || fallbackMessage);
    apiError.status = status;
    apiError.payload = payload;
    return apiError;
  }
  return error instanceof Error ? error : new Error(fallbackMessage);
}

function ensureAbsoluteUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('data:')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.origin}${normalized}`;
}

function normalizeMenuCategory(source) {
  if (!source) return null;
  const createdAt = source.createdAt || source.created_at || null;
  const updatedAt = source.updatedAt || source.updated_at || null;
  return {
    ...source,
    id:
      typeof source.id === 'string'
        ? source.id
        : source.id != null
          ? String(source.id)
          : '',
    name: source.name || '',
    description: source.description || '',
    itemCount: Number.isFinite(Number(source.itemCount))
      ? Number(source.itemCount)
      : 0,
    sortOrder: Number.isFinite(Number(source.sortOrder))
      ? Number(source.sortOrder)
      : 0,
    createdAt,
    updatedAt,
  };
}

function normalizeMenuItem(source) {
  if (!source) return null;
  const categoryId =
    source.categoryId ??
    source.category_id ??
    (Array.isArray(source.categoryIds) ? source.categoryIds[0] : null) ??
    null;
  const archivedAt = source.archivedAt || source.archived_at || null;
  const createdAt = source.createdAt || source.created_at || null;
  const updatedAt = source.updatedAt || source.updated_at || null;

  const normalizedPrice = Number(source.price ?? source.amount ?? 0);

  const normalized = {
    ...source,
    id:
      typeof source.id === 'string'
        ? source.id
        : source.id != null
          ? String(source.id)
          : '',
    name: source.name || source.title || 'Menu Item',
    description: source.description || '',
    category: source.category || '',
    categoryId: categoryId ? String(categoryId) : null,
    price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
    available: Boolean(
      source.available ??
        source.isAvailable ??
        (source.archived != null ? !source.archived : true)
    ),
    archived: Boolean(source.archived ?? source.isArchived ?? false),
    archivedAt,
    image: ensureAbsoluteUrl(
      source.image || source.imageUrl || source.image_url || source.thumbnail
    ),
    ingredients: Array.isArray(source.ingredients)
      ? source.ingredients
      : source.ingredients
        ? [source.ingredients].flat()
        : [],
    preparationTime: Number(
      source.preparationTime ?? source.preparation_time ?? 0
    ),
    createdAt,
    updatedAt,
  };

  return normalized;
}

function normalizeUser(source) {
  if (!source) return null;
  const employeeId =
    source.employeeId ?? source.employee_id ?? source.employee?.id ?? null;
  if (employeeId && source.employeeId !== employeeId) {
    return { ...source, employeeId };
  }
  if (!employeeId && source.employee) {
    return { ...source, employeeId: null };
  }
  return source;
}

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Mobile-Client'] = 'expo';
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (mockMode) {
      return Promise.reject(error);
    }
    if (!error.response) {
      return Promise.reject(error);
    }
    const { response, config } = error;
    if (response.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const tokens = await refreshAccessToken();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(config);
        }
      } catch (refreshErr) {
        await clearStoredTokens();
      }
    }
    return Promise.reject(error);
  }
);

async function withMockFallback(key, requestFn, mockFn, options = {}) {
  const preferMock = mockMode && typeof mockFn === 'function';

  if (preferMock) {
    emitApiEvent({ type: 'mock', key, forced: true });
    return mockFn({ key, forced: true });
  }

  try {
    const result = await requestFn();
    emitApiEvent({ type: 'success', key });
    return result;
  } catch (error) {
    const normalizedError = createApiError(error, options?.fallbackMessage);
    const allowFallback =
      typeof mockFn === 'function' &&
      (mockMode || isNetworkError(error) || options?.allowFallbackOnError);

    if (allowFallback) {
      emitApiEvent({
        type: 'fallback',
        key,
        error: normalizedError,
        mockMode,
      });
      return mockFn({ key, error: normalizedError });
    }

    emitApiEvent({ type: 'error', key, error: normalizedError });
    throw normalizedError;
  }
}

export async function getStoredTokens() {
  const pairs = await AsyncStorage.multiGet([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);
  const map = Object.fromEntries(pairs);
  return {
    accessToken: map[ACCESS_TOKEN_KEY] || null,
    refreshToken: map[REFRESH_TOKEN_KEY] || null,
  };
}

export async function storeTokens({ accessToken, refreshToken }) {
  const writes = [];
  if (accessToken) writes.push([ACCESS_TOKEN_KEY, accessToken]);
  if (refreshToken) writes.push([REFRESH_TOKEN_KEY, refreshToken]);
  if (writes.length) {
    await AsyncStorage.multiSet(writes);
  }
}

export async function clearStoredTokens() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  await AsyncStorage.removeItem(USER_CACHE_KEY);
}

async function refreshAccessToken() {
  if (mockMode) {
    const tokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
    await storeTokens(tokens);
    return tokens;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = await getStoredTokens();
      if (!refreshToken) {
        throw new Error('Missing refresh token');
      }
      const response = await authlessApi.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      const data = unwrapPayload(response) || {};
      const next = {
        accessToken: data.token || data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
      };
      if (!next.accessToken) {
        throw new Error('Invalid refresh response');
      }
      await storeTokens(next);
      return next;
    })();
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function login({ email, password, remember = false }) {
  const result = await withMockFallback(
    'auth.login',
    async () => {
      const response = await authlessApi.post('/auth/login', {
        email,
        password,
        remember,
      });
      const data = unwrapPayload(response) || {};
      const meta = extractMeta(response);
      return {
        user: normalizeUser(data.user),
        tokens: {
          accessToken: data.token || data.accessToken,
          refreshToken: data.refreshToken,
        },
        meta,
      };
    },
    () => mockLogin({ email, password }),
    { fallbackMessage: 'Unable to login' }
  );

  if (result?.tokens) {
    await storeTokens(result.tokens);
  }
  if (result?.user) {
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(result.user));
  }
  return result;
}

export async function loginWithGoogle({
  credential,
  code,
  codeVerifier,
  redirectUri,
} = {}) {
  const payload = {};
  if (credential) payload.credential = credential;
  if (code) payload.code = code;
  if (codeVerifier) payload.codeVerifier = codeVerifier;
  if (redirectUri) payload.redirectUri = redirectUri;

  if (!payload.credential && !payload.code) {
    throw new Error('Missing Google credential or authorization code');
  }

  const result = await withMockFallback(
    'auth.google',
    async () => {
      const response = await authlessApi.post('/auth/google', payload);
      const data = unwrapPayload(response) || {};
      const meta = extractMeta(response);
      const user = normalizeUser(data.user || null);
      const tokens = {
        accessToken: data.token || data.accessToken || null,
        refreshToken: data.refreshToken || null,
      };
      return {
        success: data.success ?? true,
        pending: Boolean(data.pending),
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        verifyToken: data.verifyToken || null,
        meta,
        message: data.message || meta?.message || null,
      };
    },
    () => mockLoginWithGoogle({ email: payload.email }),
    { fallbackMessage: 'Unable to login with Google' }
  );

  if (result?.token || result?.refreshToken) {
    await storeTokens({
      accessToken: result.token,
      refreshToken: result.refreshToken,
    });
  } else {
    await clearStoredTokens();
  }

  if (result?.user) {
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(result.user));
  }

  return result;
}

export async function logout() {
  await withMockFallback(
    'auth.logout',
    async () => {
      const { refreshToken } = await getStoredTokens();
      if (refreshToken) {
        await authlessApi.post('/auth/logout', { refresh_token: refreshToken });
      }
    },
    () => mockLogout()
  );

  await clearStoredTokens();
}

export async function registerAccount(payload) {
  return withMockFallback(
    'auth.register',
    async () => {
      const response = await authlessApi.post('/auth/register', payload);
      const meta = extractMeta(response);
      return {
        data: unwrapPayload(response),
        meta,
        success: meta?.success ?? true,
      };
    },
    () => mockRegisterAccount(payload),
    { fallbackMessage: 'Registration failed' }
  );
}

export async function requestPasswordReset(payload) {
  return withMockFallback(
    'auth.password-reset',
    async () => {
      const response = await authlessApi.post(
        '/auth/password-reset/request',
        payload
      );
      return { data: unwrapPayload(response), meta: extractMeta(response) };
    },
    () => mockRequestPasswordReset(payload),
    { fallbackMessage: 'Unable to send reset email' }
  );
}

export async function getCurrentUser({ forceRefresh = true } = {}) {
  if (!forceRefresh) {
    const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        // ignore bad cache and refetch
      }
    }
  }

  const user = await withMockFallback(
    'users.me',
    async () => {
      const response = await api.get('/users/me');
      return normalizeUser(unwrapPayload(response));
    },
    () => mockGetCurrentUser(),
    { fallbackMessage: 'Unable to load profile' }
  );

  if (user) {
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  }
  return user;
}

export async function updateProfile(payload) {
  const user = await withMockFallback(
    'users.update',
    async () => {
      const response = await api.patch('/users/me', payload);
      return normalizeUser(unwrapPayload(response));
    },
    () => mockUpdateProfile(payload),
    { fallbackMessage: 'Unable to update profile' }
  );

  if (user) {
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  }
  return user;
}

export async function uploadProfileAvatar({ uri, name, type } = {}) {
  const user = await withMockFallback(
    'users.avatar.upload',
    async () => {
      if (!uri) {
        throw new Error('Image URI is required');
      }
      const formData = new FormData();
      const fileName =
        name ||
        `avatar-${Date.now()}.${(type && type.split('/').pop()) || 'jpg'}`;
      formData.append('avatar', {
        uri,
        name: fileName,
        type: type || 'image/jpeg',
      });
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return normalizeUser(unwrapPayload(response));
    },
    () => mockUploadAvatar({ uri, name, type }),
    { fallbackMessage: 'Unable to update profile photo' }
  );

  if (user) {
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  }
  return user;
}

export async function fetchMenuCategories() {
  return withMockFallback(
    'menu.categories',
    async () => {
      const response = await api.get('/menu/categories');
      const payload = unwrapPayload(response) || [];
      return Array.isArray(payload) ? payload.map(normalizeMenuCategory) : [];
    },
    async () => {
      const result = await mockFetchMenuCategories();
      return Array.isArray(result) ? result.map(normalizeMenuCategory) : [];
    },
    { fallbackMessage: 'Unable to load categories' }
  );
}

export async function fetchMenuItems(params = {}) {
  return withMockFallback(
    'menu.items',
    async () => {
      const response = await api.get('/menu/items', { params });
      const raw = unwrapPayload(response);
      const items = Array.isArray(raw)
        ? raw.map(normalizeMenuItem)
        : Array.isArray(raw?.items)
          ? raw.items.map(normalizeMenuItem)
          : [];
      return {
        items,
        pagination: response?.data?.pagination || null,
        meta: extractMeta(response),
      };
    },
    async () => {
      const result = await mockFetchMenuItems(params);
      if (Array.isArray(result)) {
        return {
          items: result.map(normalizeMenuItem),
          pagination: null,
          meta: null,
        };
      }
      const items = Array.isArray(result?.items)
        ? result.items.map(normalizeMenuItem)
        : [];
      return {
        items,
        pagination: result?.pagination || null,
        meta: result?.meta || null,
      };
    },
    { fallbackMessage: 'Unable to load menu items' }
  );
}

export async function fetchInventory(params = {}) {
  return withMockFallback(
    'inventory.list',
    async () => {
      const response = await api.get('/inventory/items', { params });
      return unwrapPayload(response) || [];
    },
    () => mockFetchInventory(params),
    { fallbackMessage: 'Unable to load inventory' }
  );
}

export async function updateInventoryItem(itemId, payload) {
  return withMockFallback(
    'inventory.update',
    async () => {
      const response = await api.patch(`/inventory/items/${itemId}`, payload);
      return unwrapPayload(response);
    },
    () => mockUpdateInventoryItem(itemId, payload),
    { fallbackMessage: 'Unable to update inventory item' }
  );
}

export async function fetchOrders(params = {}) {
  return withMockFallback(
    'orders.list',
    async () => {
      const response = await api.get('/orders', { params });
      return unwrapPayload(response) || [];
    },
    () => mockFetchOrders(params),
    { fallbackMessage: 'Unable to load orders' }
  );
}

export async function updateOrderStatus(orderId, payload) {
  return withMockFallback(
    'orders.update',
    async () => {
      const response = await api.patch(`/orders/${orderId}`, payload);
      return unwrapPayload(response);
    },
    () => mockUpdateOrderStatus(orderId, payload),
    { fallbackMessage: 'Unable to update order status' }
  );
}

export async function fetchPayments(params = {}) {
  return withMockFallback(
    'payments.list',
    async () => {
      const response = await api.get('/payments/transactions', { params });
      return unwrapPayload(response) || [];
    },
    () => mockFetchPayments(params),
    { fallbackMessage: 'Unable to load payments' }
  );
}

export async function createPayment(payload) {
  return withMockFallback(
    'payments.create',
    async () => {
      const response = await api.post('/payments/transactions', payload);
      return unwrapPayload(response);
    },
    () => mockCreatePayment(payload),
    { fallbackMessage: 'Unable to process payment' }
  );
}

export async function refundPayment(paymentId) {
  return withMockFallback(
    'payments.refund',
    async () => {
      const response = await api.post(
        `/payments/transactions/${paymentId}/refund`
      );
      return unwrapPayload(response);
    },
    () => mockRefundPayment(paymentId),
    { fallbackMessage: 'Unable to process refund' }
  );
}

export default api;
