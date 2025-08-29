import apiClient from '../client';
import { mockOrders } from '../mockData';

// Mock delay for realistic API simulation
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

class OrderService {
  async getOrders(params = {}) {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/orders?${queryParams}`);
    
    // Mock implementation
    return {
      success: true,
      data: mockOrders,
      pagination: {
        page: 1,
        limit: 50,
        total: mockOrders.length,
        totalPages: 1
      }
    };
  }

  async getOrderById(orderId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.get(`/orders/${orderId}`);
    
    // Mock implementation
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    return {
      success: true,
      data: order
    };
  }

  async createOrder(orderData) {
    await mockDelay(1000);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/orders', orderData);
    
    // Mock implementation
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `W-${String(Date.now()).slice(-3)}`,
      ...orderData,
      status: 'pending',
      timeReceived: new Date().toISOString(),
      timeCompleted: null
    };
    
    return {
      success: true,
      data: newOrder
    };
  }

  async updateOrderStatus(orderId, status) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.patch(`/orders/${orderId}/status`, { status });
    
    // Mock implementation
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    const updatedOrder = {
      ...mockOrders[orderIndex],
      status,
      timeCompleted: status === 'completed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedOrder
    };
  }

  async cancelOrder(orderId, reason) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.patch(`/orders/${orderId}/cancel`, { reason });
    
    // Mock implementation
    return this.updateOrderStatus(orderId, 'cancelled');
  }

  async getOrderQueue(params = {}) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/orders/queue?${queryParams}`);
    
    // Mock implementation
    const queueOrders = mockOrders.filter(order => 
      ['pending', 'preparing', 'ready'].includes(order.status)
    );
    
    return {
      success: true,
      data: queueOrders
    };
  }

  async getOrderHistory(params = {}) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/orders/history?${queryParams}`);
    
    // Mock implementation
    const historyOrders = mockOrders.filter(order => 
      ['completed', 'cancelled'].includes(order.status)
    );
    
    return {
      success: true,
      data: historyOrders,
      pagination: {
        page: 1,
        limit: 20,
        total: historyOrders.length,
        totalPages: 1
      }
    };
  }

  async processPayment(orderId, paymentData) {
    await mockDelay(1200);
    
    // TODO: Replace with actual API call
    // return apiClient.post(`/orders/${orderId}/payment`, paymentData);
    
    // Mock implementation
    return {
      success: true,
      data: {
        paymentId: Date.now().toString(),
        orderId,
        amount: paymentData.amount,
        method: paymentData.method,
        status: 'completed',
        reference: paymentData.method === 'card' ? `TXN-${Date.now()}` : null,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export const orderService = new OrderService();
export default orderService;