import apiClient from '../client';
import { mockMenuItems } from '../mockData';

// Mock delay for realistic API simulation
const mockDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const USE_MOCKS = !(
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  (import.meta.env.VITE_ENABLE_MOCKS === 'false' ||
    import.meta.env.VITE_ENABLE_MOCKS === '0')
);

class MenuService {
  async getMenuItems(params = {}) {
    if (!USE_MOCKS) {
      try {
        const qs = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '')
            qs.append(k, String(v));
        });
        const res = await apiClient.get(`/menu/items?${qs.toString()}`, {
          retry: { retries: 1 },
        });
        const data = res?.data || res || [];
        const pagination = res?.pagination || {
          page: 1,
          limit: Array.isArray(data) ? data.length : 0,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: 1,
        };
        return { success: true, data, pagination };
      } catch (e) {
        console.warn('getMenuItems API failed, using mocks:', e?.message);
      }
    }
    await mockDelay();
    return {
      success: true,
      data: mockMenuItems,
      pagination: {
        page: 1,
        limit: 50,
        total: mockMenuItems.length,
        totalPages: 1,
      },
    };
  }

  async getMenuItemById(itemId) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.get(`/menu/items/${itemId}`, {
          retry: { retries: 1 },
        });
        const data = res?.data || res;
        return { success: true, data };
      } catch (e) {
        console.warn('getMenuItemById API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(600);
    const item = mockMenuItems.find((i) => i.id === itemId);
    if (!item) throw new Error('Menu item not found');
    return { success: true, data: item };
  }

  async createMenuItem(itemData) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/menu/items', itemData, {
          retry: { retries: 1 },
        });
        return { success: true, data: res?.data || res };
      } catch (e) {
        console.warn('createMenuItem API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(400);
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      available: true,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newItem };
  }

  async updateMenuItem(itemId, updates) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.put(`/menu/items/${itemId}`, updates, {
          retry: { retries: 1 },
        });
        return { success: true, data: res?.data || res };
      } catch (e) {
        console.warn('updateMenuItem API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(300);
    const itemIndex = mockMenuItems.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) throw new Error('Menu item not found');
    const updatedItem = {
      ...mockMenuItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: updatedItem };
  }

  async deleteMenuItem(itemId) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.delete(`/menu/items/${itemId}`, {
          retry: { retries: 1 },
        });
        return { success: true, data: res?.data || true };
      } catch (e) {
        console.warn('deleteMenuItem API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(200);
    const item = mockMenuItems.find((i) => i.id === itemId);
    if (!item) throw new Error('Menu item not found');
    return { success: true, message: 'Menu item deleted successfully' };
  }

  async updateItemAvailability(itemId, available) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.patch(
          `/menu/items/${itemId}/availability`,
          { available },
          { retry: { retries: 1 } }
        );
        return { success: true, data: res?.data || res };
      } catch (e) {
        console.warn(
          'updateItemAvailability API failed, using mocks:',
          e?.message
        );
      }
    }
    await mockDelay(150);
    return this.updateMenuItem(itemId, { available });
  }

  async getCategories() {
    await mockDelay(400);

    // TODO: Replace with actual API call
    // return apiClient.get('/menu/categories');

    // Mock implementation
    const categories = [...new Set(mockMenuItems.map((item) => item.category))];
    return {
      success: true,
      data: categories.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        itemCount: mockMenuItems.filter((item) => item.category === name)
          .length,
      })),
    };
  }

  async uploadItemImage(itemId, imageFile) {
    if (!USE_MOCKS) {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await apiClient.post(`/menu/items/${itemId}/image`, null, {
          body: formData,
          retry: { retries: 1 },
        });
        return { success: true, data: res?.data || res };
      } catch (e) {
        console.warn('uploadItemImage API failed, using mocks:', e?.message);
      }
    }
    await mockDelay(500);
    return {
      success: true,
      data: { imageUrl: `/images/menu/${itemId}-${Date.now()}.jpg` },
    };
  }
}

export const menuService = new MenuService();
export default menuService;
