import apiClient from '../client';

// Mock delay for realistic API simulation
const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  async login(email, password, options = {}) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/login', { email, password, ...options });
    
    // Mock implementation
    if (email === 'admin@canteen.com' && password === '1234') {
      return {
        success: true,
        user: {
          id: '1',
          name: 'Admin User',
          email: email,
          role: 'admin'
        },
        token: 'mock-jwt-token-12345'
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async register(userData) {
    await mockDelay(1000);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/register', userData);
    
    // Mock implementation
    return {
      success: true,
      user: {
        id: Date.now().toString(),
        ...userData,
        role: 'staff'
      },
      token: 'mock-jwt-token-' + Date.now()
    };
  }

  async logout() {
    await mockDelay(300);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/logout');
    
    // Mock implementation
    return { success: true };
  }

  async socialLogin(provider) {
    await mockDelay(1200);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/social', { provider });
    
    // Mock implementation
    return {
      success: true,
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@canteen.com',
        role: 'admin'
      },
      token: 'mock-social-token-' + Date.now()
    };
  }

  async forgotPassword(email) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/forgot-password', { email });
    
    // Mock implementation
    return { success: true, message: 'Password reset email sent' };
  }

  async resetPassword(token, newPassword) {
    await mockDelay(800);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/reset-password', { token, newPassword });
    
    // Mock implementation
    return { success: true, message: 'Password reset successful' };
  }

  async refreshToken() {
    await mockDelay(500);
    
    // TODO: Replace with actual API call
    // return apiClient.post('/auth/refresh-token');
    
    // Mock implementation
    return {
      success: true,
      token: 'mock-refreshed-token-' + Date.now()
    };
  }
}

export const authService = new AuthService();
export default authService;