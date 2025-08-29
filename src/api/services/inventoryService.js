import apiClient from '../client';
import { mockInventoryItems } from '../mockData';

// Mock delay for realistic API simulation
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

class InventoryService {
  async getInventoryItems(params = {}) {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/inventory/items?${queryParams}`);
    
    // Mock implementation
    return {
      success: true,
      data: mockInventoryItems,
      pagination: {
        page: 1,
        limit: 50,
        total: mockInventoryItems.length,
        totalPages: 1
      }
    };
  }

  async getInventoryItemById(itemId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.get(`/inventory/items/${itemId}`);
    
    // Mock implementation
    const item = mockInventoryItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    return {
      success: true,
      data: item
    };
  }

  async createInventoryItem(itemData) {
    await mockDelay(1000);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/inventory/items', itemData);
    
    // Mock implementation
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      createdAt: new Date().toISOString(),
      lastRestocked: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newItem
    };
  }

  async updateInventoryItem(itemId, updates) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // return apiClient.put(`/inventory/items/${itemId}`, updates);
    
    // Mock implementation
    const itemIndex = mockInventoryItems.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Inventory item not found');
    }
    
    const updatedItem = {
      ...mockInventoryItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedItem
    };
  }

  async deleteInventoryItem(itemId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.delete(`/inventory/items/${itemId}`);
    
    // Mock implementation
    const item = mockInventoryItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    return {
      success: true,
      message: 'Inventory item deleted successfully'
    };
  }

  async updateStock(itemId, quantity, operation = 'set') {
    await mockDelay(500);
    
    // TODO: Replace with actual API call
    // return apiClient.patch(`/inventory/items/${itemId}/stock`, { quantity, operation });
    
    // Mock implementation
    const item = mockInventoryItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = item.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, item.quantity - quantity);
        break;
      default:
        newQuantity = quantity;
    }
    
    return this.updateInventoryItem(itemId, { 
      quantity: newQuantity,
      lastRestocked: operation === 'add' ? new Date().toISOString() : item.lastRestocked
    });
  }

  async getLowStockItems(threshold) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.get(`/inventory/low-stock?threshold=${threshold}`);
    
    // Mock implementation
    const lowStockItems = mockInventoryItems.filter(item => 
      item.quantity <= (threshold || item.minStock)
    );
    
    return {
      success: true,
      data: lowStockItems
    };
  }

  async getInventoryActivities(params = {}) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/inventory/activities?${queryParams}`);
    
    // Mock implementation
    return {
      success: true,
      data: [
        {
          id: '1',
          itemId: '1',
          itemName: 'Canton Noodles',
          action: 'restock',
          quantityChange: 20,
          previousQuantity: 30,
          newQuantity: 50,
          reason: 'Weekly restock',
          performedBy: 'Admin User',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          itemId: '2',
          itemName: 'Ground Pork',
          action: 'usage',
          quantityChange: -5,
          previousQuantity: 30,
          newQuantity: 25,
          reason: 'Order preparation',
          performedBy: 'Kitchen Staff',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    };
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;