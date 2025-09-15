import apiClient from '../client';

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
    return {
      success: true,
      data: raw?.data || raw || [],
      pagination: raw?.pagination || {
        page: 1,
        limit: Array.isArray(raw?.data || raw) ? (raw?.data || raw).length : 0,
        total: Array.isArray(raw?.data || raw) ? (raw?.data || raw).length : 0,
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
    const res = await apiClient.delete(`/menu/items/${itemId}`, {
      retry: { retries: 1 },
    });
    return { success: true, data: res?.data || true };
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

  async uploadItemImage(itemId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await apiClient.post(`/menu/items/${itemId}/image`, null, {
      body: formData,
      retry: { retries: 1 },
    });
    return { success: true, data: res?.data || res };
  }
}

export const menuService = new MenuService();
export default menuService;
