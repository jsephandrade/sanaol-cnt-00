import apiClient from '../client';
import { mockMenuItems } from '../mockData';

// Mock delay for realistic API simulation
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

class MenuService {
  async getMenuItems(params = {}) {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/menu/items?${queryParams}`);
    
    // Mock implementation
    return {
      success: true,
      data: mockMenuItems,
      pagination: {
        page: 1,
        limit: 50,
        total: mockMenuItems.length,
        totalPages: 1
      }
    };
  }

  async getMenuItemById(itemId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.get(`/menu/items/${itemId}`);
    
    // Mock implementation
    const item = mockMenuItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    
    return {
      success: true,
      data: item
    };
  }

  async createMenuItem(itemData) {
    await mockDelay(1000);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/menu/items', itemData);
    
    // Mock implementation
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      available: true,
      createdAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newItem
    };
  }

  async updateMenuItem(itemId, updates) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // return apiClient.put(`/menu/items/${itemId}`, updates);
    
    // Mock implementation
    const itemIndex = mockMenuItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Menu item not found');
    }
    
    const updatedItem = {
      ...mockMenuItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedItem
    };
  }

  async deleteMenuItem(itemId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.delete(`/menu/items/${itemId}`);
    
    // Mock implementation
    const item = mockMenuItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    
    return {
      success: true,
      message: 'Menu item deleted successfully'
    };
  }

  async updateItemAvailability(itemId, available) {
    await mockDelay(500);
    
    // TODO: Replace with actual API call
    // return apiClient.patch(`/menu/items/${itemId}/availability`, { available });
    
    // Mock implementation
    return this.updateMenuItem(itemId, { available });
  }

  async getCategories() {
    await mockDelay(400);
    
    // TODO: Replace with actual API call
    // return apiClient.get('/menu/categories');
    
    // Mock implementation
    const categories = [...new Set(mockMenuItems.map(item => item.category))];
    return {
      success: true,
      data: categories.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        itemCount: mockMenuItems.filter(item => item.category === name).length
      }))
    };
  }

  async uploadItemImage(itemId, imageFile) {
    await mockDelay(2000);
    
    // TODO: Replace with actual API call
    // const formData = new FormData();
    // formData.append('image', imageFile);
    // return apiClient.post(`/menu/items/${itemId}/image`, formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    
    // Mock implementation
    return {
      success: true,
      data: {
        imageUrl: `/images/menu/${itemId}-${Date.now()}.jpg`
      }
    };
  }
}

export const menuService = new MenuService();
export default menuService;