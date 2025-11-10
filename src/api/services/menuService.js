import apiClient from '../client';
import { getEnvValue, resolveApiBase, resolveMediaBase } from '../env';

const ABSOLUTE_MEDIA_REGEX = /^(blob:|data:|https?:\/\/)/i;
const ABSOLUTE_HTTP_REGEX = /^https?:\/\//i;
const IMAGE_KEYS = [
  'imageUrl',
  'image_url',
  'image',
  'photo',
  'picture',
  'image_path',
  'img',
  'url',
  'path',
  'location',
  'href',
];

const pickUrl = (source) => {
  if (!source) return '';
  for (const key of IMAGE_KEYS) {
    const value = source?.[key];
    if (!value) continue;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const nested = pickUrl(value);
      if (nested) return nested;
    }
  }
  return '';
};

const computeBackendOrigin = () => {
  const candidates = [
    resolveMediaBase(''),
    getEnvValue(
      ['VITE_API_BASE_URL', 'API_BASE_URL', 'EXPO_PUBLIC_API_URL'],
      ''
    ),
    apiClient?.baseURL,
    resolveApiBase(''),
  ];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    if (!ABSOLUTE_HTTP_REGEX.test(candidate)) continue;
    try {
      return new URL(candidate).origin;
    } catch {
      continue;
    }
  }
  try {
    return typeof window !== 'undefined' ? window.location.origin : '';
  } catch {
    return '';
  }
};

const absoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (ABSOLUTE_MEDIA_REGEX.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  const origin = computeBackendOrigin();
  if (!origin) return path;
  try {
    return new URL(path, origin).toString();
  } catch {
    return path;
  }
};

const normalizeImage = (obj) => absoluteUrl(pickUrl(obj));

class MenuService {
  async getMenuItems(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const res = await apiClient.get(`/menu/items?${qs.toString()}`, {
      retry: { retries: 1 },
    });
    const raw = res?.data || res;
    const list = raw?.data || raw || [];
    const normalized = Array.isArray(list)
      ? list.map((it) => ({
          ...it,
          image: normalizeImage(it),
        }))
      : [];
    return {
      success: true,
      data: normalized,
      pagination: raw?.pagination || {
        page: 1,
        limit: Array.isArray(list) ? list.length : 0,
        total: Array.isArray(list) ? list.length : 0,
        totalPages: 1,
      },
    };
  }

  async getMenuItemById(itemId) {
    const res = await apiClient.get(`/menu/items/${itemId}`, {
      retry: { retries: 1 },
    });
    const data = res?.data || res;
    return { success: true, data };
  }

  async createMenuItem(itemData) {
    const res = await apiClient.post('/menu/items', itemData, {
      retry: { retries: 1 },
    });
    return { success: true, data: res?.data || res };
  }

  async updateMenuItem(itemId, updates) {
    const res = await apiClient.put(`/menu/items/${itemId}`, updates, {
      retry: { retries: 1 },
    });
    return { success: true, data: res?.data || res };
  }

  async deleteMenuItem(itemId) {
    const res = await apiClient.post(
      `/menu/items/${encodeURIComponent(itemId)}/archive`,
      {},
      { retry: { retries: 1 } }
    );
    return { success: true, data: res?.data || res };
  }

  async restoreMenuItem(itemId) {
    const res = await apiClient.post(
      `/menu/items/${encodeURIComponent(itemId)}/restore`,
      {},
      { retry: { retries: 1 } }
    );
    return { success: true, data: res?.data || res };
  }

  async updateItemAvailability(itemId, available) {
    const res = await apiClient.patch(
      `/menu/items/${itemId}/availability`,
      { available },
      { retry: { retries: 1 } }
    );
    return { success: true, data: res?.data || res };
  }

  async getCategories() {
    const res = await apiClient.get('/menu/categories', {
      retry: { retries: 1 },
    });
    const raw = res?.data || res;
    return { success: true, data: raw?.data || raw };
  }

  async createCategory(categoryData) {
    const res = await apiClient.post('/menu/categories', categoryData, {
      retry: { retries: 1 },
    });
    return { success: true, data: res?.data || res };
  }

  async uploadItemImage(itemId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await apiClient.post(`/menu/items/${itemId}/image`, null, {
      body: formData,
      retry: { retries: 1 },
    });
    const raw = res?.data || res || {};
    const imageUrlAbs = normalizeImage(raw);
    const imageUrl = imageUrlAbs
      ? `${imageUrlAbs}${imageUrlAbs.includes('?') ? '&' : '?'}v=${Date.now()}`
      : '';
    return { success: true, data: { imageUrl } };
  }
}

export const menuService = new MenuService();
export default menuService;
