import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_ORIGIN = (
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000'
).replace(/\/$/, '');
const REST_PREFIX = '/api/v1';
const BASE_URL = `${API_ORIGIN}${REST_PREFIX}`;

export const ACCESS_TOKEN_KEY = '@sanaol/auth/accessToken';
export const REFRESH_TOKEN_KEY = '@sanaol/auth/refreshToken';
export const USER_CACHE_KEY = '@sanaol/auth/user';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const authlessApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

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
  try {
    const response = await authlessApi.post('/auth/login', {
      email,
      password,
      remember,
    });
    const data = unwrapPayload(response) || {};
    const meta = extractMeta(response);
    const tokens = {
      accessToken: data.token || data.accessToken,
      refreshToken: data.refreshToken,
    };
    if (tokens.accessToken && tokens.refreshToken) {
      await storeTokens(tokens);
    }
    if (data.user) {
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
    }
    return { user: data.user, tokens, meta };
  } catch (error) {
    throw createApiError(error, 'Unable to login');
  }
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

  try {
    const response = await authlessApi.post('/auth/google', payload);
    const data = unwrapPayload(response) || {};
    const meta = extractMeta(response);
    const user = normalizeUser(data.user || null);
    const tokens = {
      accessToken: data.token || data.accessToken || null,
      refreshToken: data.refreshToken || null,
    };
    if (tokens.accessToken) {
      await storeTokens(tokens);
      if (user) {
        await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      }
    } else {
      await clearStoredTokens();
    }
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
  } catch (error) {
    throw createApiError(error, 'Unable to login with Google');
  }
}

export async function logout() {
  try {
    const { refreshToken } = await getStoredTokens();
    if (refreshToken) {
      await authlessApi.post('/auth/logout', { refresh_token: refreshToken });
    }
  } catch (error) {
    // Best-effort logout; ignore server errors
  } finally {
    await clearStoredTokens();
  }
}

export async function registerAccount(payload) {
  try {
    const response = await authlessApi.post('/auth/register', payload);
    const meta = extractMeta(response);
    return {
      data: unwrapPayload(response),
      meta,
      success: meta?.success ?? true,
    };
  } catch (error) {
    throw createApiError(error, 'Registration failed');
  }
}

export async function requestPasswordReset(payload) {
  try {
    const response = await authlessApi.post(
      '/auth/password-reset/request',
      payload
    );
    return { data: unwrapPayload(response), meta: extractMeta(response) };
  } catch (error) {
    throw createApiError(error, 'Unable to send reset email');
  }
}

export async function getCurrentUser({ forceRefresh = true } = {}) {
  if (!forceRefresh) {
    const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  }
  try {
    const response = await api.get('/users/me');
    const user = unwrapPayload(response);
    if (user) {
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    }
    return user;
  } catch (error) {
    throw createApiError(error, 'Unable to load profile');
  }
}

export async function updateProfile(payload) {
  try {
    const response = await api.patch('/users/me', payload);
    const user = unwrapPayload(response);
    if (user) {
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    }
    return user;
  } catch (error) {
    throw createApiError(error, 'Unable to update profile');
  }
}

export async function fetchInventory(params = {}) {
  try {
    const response = await api.get('/inventory/items', { params });
    return unwrapPayload(response) || [];
  } catch (error) {
    throw createApiError(error, 'Unable to load inventory');
  }
}

export async function updateInventoryItem(itemId, payload) {
  try {
    const response = await api.patch(`/inventory/items/${itemId}`, payload);
    return unwrapPayload(response);
  } catch (error) {
    throw createApiError(error, 'Unable to update inventory item');
  }
}

export async function fetchOrders(params = {}) {
  try {
    const response = await api.get('/orders', { params });
    return unwrapPayload(response) || [];
  } catch (error) {
    throw createApiError(error, 'Unable to load orders');
  }
}

export async function updateOrderStatus(orderId, payload) {
  try {
    const response = await api.patch(`/orders/${orderId}`, payload);
    return unwrapPayload(response);
  } catch (error) {
    throw createApiError(error, 'Unable to update order status');
  }
}

export async function fetchPayments(params = {}) {
  try {
    const response = await api.get('/payments/transactions', { params });
    return unwrapPayload(response) || [];
  } catch (error) {
    throw createApiError(error, 'Unable to load payments');
  }
}

export async function createPayment(payload) {
  try {
    const response = await api.post('/payments/transactions', payload);
    return unwrapPayload(response);
  } catch (error) {
    throw createApiError(error, 'Unable to process payment');
  }
}

export async function refundPayment(paymentId) {
  try {
    const response = await api.post(
      `/payments/transactions/${paymentId}/refund`
    );
    return unwrapPayload(response);
  } catch (error) {
    throw createApiError(error, 'Unable to process refund');
  }
}

export default api;
