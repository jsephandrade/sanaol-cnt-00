import apiClient from '../client';
import { mockUsers } from '../mockData';

// Mock delay for realistic API simulation
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

class UserService {
  async getUsers(params = {}) {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(params).toString();
    // return apiClient.get(`/users?${queryParams}`);
    
    // Mock implementation
    return {
      success: true,
      data: mockUsers,
      pagination: {
        page: 1,
        limit: 20,
        total: mockUsers.length,
        totalPages: 1
      }
    };
  }

  async getUserById(userId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.get(`/users/${userId}`);
    
    // Mock implementation
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      data: user
    };
  }

  async createUser(userData) {
    await mockDelay(1000);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/users', userData);
    
    // Mock implementation
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    return {
      success: true,
      data: newUser
    };
  }

  async updateUser(userId, updates) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // return apiClient.put(`/users/${userId}`, updates);
    
    // Mock implementation
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: updatedUser
    };
  }

  async deleteUser(userId) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.delete(`/users/${userId}`);
    
    // Mock implementation
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  async updateUserStatus(userId, status) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.patch(`/users/${userId}/status`, { status });
    
    // Mock implementation
    return this.updateUser(userId, { status });
  }

  async getRoles() {
    await mockDelay(400);
    
    // TODO: Replace with actual API call
    // return apiClient.get('/users/roles');
    
    // Mock implementation
    return {
      success: true,
      data: [
        {
          label: 'Admin',
          value: 'admin',
          description: 'Full access to all settings and functions',
          permissions: ['all']
        },
        {
          label: 'Manager',
          value: 'manager',
          description: 'Can manage most settings and view reports',
          permissions: ['menu', 'inventory', 'reports', 'users:read']
        },
        {
          label: 'Staff',
          value: 'staff',
          description: 'Kitchen and service staff access',
          permissions: ['orders', 'inventory:read']
        },
        {
          label: 'Cashier',
          value: 'cashier',
          description: 'POS and payment access only',
          permissions: ['pos', 'payments']
        }
      ]
    };
  }

  async updateUserRole(userId, role) {
    await mockDelay(600);
    
    // TODO: Replace with actual API call
    // return apiClient.patch(`/users/${userId}/role`, { role });
    
    // Mock implementation
    return this.updateUser(userId, { role });
  }
}

export const userService = new UserService();
export default userService;