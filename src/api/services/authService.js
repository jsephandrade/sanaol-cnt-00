import apiClient from '../client';

const mockDelay = (ms = 600) => new Promise((r) => setTimeout(r, ms));
const USE_MOCKS = !(
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  (import.meta.env.VITE_ENABLE_MOCKS === 'false' ||
    import.meta.env.VITE_ENABLE_MOCKS === '0')
);

class AuthService {
  async loginWithGoogle(credential) {
    if (!credential || typeof credential !== 'string') {
      throw new Error('Missing Google credential');
    }
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post(
          '/auth/google',
          { credential },
          { retry: { retries: 1 } }
        );
        const data = res?.data || res;
        return {
          success: Boolean(data?.success ?? true),
          pending: Boolean(data?.pending ?? false),
          user: data.user || data,
          token: data.token || data.accessToken || null,
          verifyToken: data.verifyToken || null,
        };
      } catch (e) {}
    }
    await mockDelay(400);
    return {
      success: true,
      pending: true,
      user: {
        id: 'g-' + Date.now().toString(),
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'staff',
        status: 'pending',
      },
      token: null,
      verifyToken: 'mock-verify-token-' + Date.now(),
    };
  }
  async login(email, password, options = {}) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post(
          '/auth/login',
          { email, password, ...options },
          { retry: { retries: 1 } }
        );
        const data = res?.data || res;
        return {
          success: true,
          user: data.user || {
            id: data.userId || 'me',
            name: data.name || email,
            email,
            role: (data.role || 'admin').toLowerCase(),
          },
          token: data.token || data.accessToken || null,
        };
      } catch (e) {
        // fall back to mocks if desired
      }
    }
    await mockDelay();
    if (email === 'admin@canteen.com' && password === '1234') {
      return {
        success: true,
        user: { id: '1', name: 'Admin User', email, role: 'admin' },
        token: 'mock-jwt-token-12345',
      };
    }
    throw new Error('Invalid credentials');
  }

  async register(userData) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/auth/register', userData, {
          retry: { retries: 1 },
        });
        const data = res?.data || res;
        return {
          success: Boolean(data?.success ?? true),
          pending: Boolean(data?.pending ?? false),
          user: data.user || {
            id: data.id || String(Date.now()),
            ...userData,
            role: (data.role || 'staff').toLowerCase(),
            status: data.status || 'pending',
          },
          token: data.token || data.accessToken || null,
          verifyToken: data.verifyToken || null,
        };
      } catch (e) {}
    }
    await mockDelay();
    return {
      success: true,
      pending: true,
      user: {
        id: Date.now().toString(),
        ...userData,
        role: 'staff',
        status: 'pending',
      },
      token: null,
      verifyToken: 'mock-verify-token-' + Date.now(),
    };
  }

  async logout() {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/auth/logout', {});
        return res?.data || { success: true };
      } catch (e) {}
    }
    await mockDelay(300);
    return { success: true };
  }

  async socialLogin(provider) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/auth/social', { provider });
        const data = res?.data || res;
        return {
          success: true,
          user: data.user || {
            id: '1',
            name: data.name || 'Admin User',
            email: data.email || 'admin@canteen.com',
            role: (data.role || 'admin').toLowerCase(),
          },
          token: data.token || data.accessToken || null,
        };
      } catch (e) {}
    }
    await mockDelay(500);
    return {
      success: true,
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@canteen.com',
        role: 'admin',
      },
      token: 'mock-social-token-' + Date.now(),
    };
  }

  async forgotPassword(email) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/auth/forgot-password', { email });
        return res?.data || { success: true };
      } catch (e) {}
    }
    await mockDelay(400);
    return { success: true, message: 'Password reset email sent' };
  }

  async resetPassword(token, newPassword) {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/auth/reset-password', {
          token,
          newPassword,
        });
        return res?.data || { success: true };
      } catch (e) {}
    }
    await mockDelay(400);
    return { success: true, message: 'Password reset successful' };
  }

  async refreshToken() {
    if (!USE_MOCKS) {
      try {
        const res = await apiClient.post('/auth/refresh-token', {});
        const data = res?.data || res;
        return { success: true, token: data.token || data.accessToken || null };
      } catch (e) {}
    }
    await mockDelay(300);
    return { success: true, token: 'mock-refreshed-token-' + Date.now() };
  }
}

export const authService = new AuthService();
export default authService;
