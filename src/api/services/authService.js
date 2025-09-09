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
    if (USE_MOCKS) {
      await mockDelay(400);
      return {
        success: true,
        pending: true,
        user: {
          id: 'g-' + Date.now().toString(),
          name: 'Google User',
          email: 'user@example.com',
          role: 'staff',
          status: 'pending',
        },
        token: null,
        verifyToken: 'mock-verify-token-' + Date.now(),
      };
    }
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
      refreshToken: data.refreshToken || null,
      verifyToken: data.verifyToken || null,
    };
  }
  async loginWithFace(imageData, options = {}) {
    if (USE_MOCKS) {
      await mockDelay(400);
      return {
        success: true,
        pending: false,
        user: {
          id: 'u-face-' + Date.now().toString(),
          name: 'Face User',
          email: 'face@example.com',
          role: 'staff',
          status: 'active',
        },
        token: 'mock-face-token-' + Date.now(),
        refreshToken: 'mock-face-rt-' + Date.now(),
      };
    }
    const remember = Boolean(options?.remember);
    const res = await apiClient.post(
      '/auth/face-login',
      { image: imageData, remember },
      { retry: { retries: 1 } }
    );
    const data = res?.data || res;
    return {
      success: Boolean(data?.success ?? true),
      pending: Boolean(data?.pending ?? false),
      user: data.user || data,
      token: data.token || data.accessToken || null,
      refreshToken: data.refreshToken || null,
      verifyToken: data.verifyToken || null,
    };
  }

  async registerFace(images) {
    // images: array of base64 data URLs or objects with { data }
    if (USE_MOCKS) {
      await mockDelay(400);
      return { success: true };
    }
    const payload = Array.isArray(images) ? { images } : { image: images };
    const res = await apiClient.post('/auth/face-register', payload, {
      retry: { retries: 1 },
    });
    return res?.data || res;
  }
  async login(email, password, options = {}) {
    if (USE_MOCKS) {
      await mockDelay();
      // Generic mock: accept any email/password and return a basic user
      return {
        success: true,
        pending: false,
        user: {
          id: 'u-' + Date.now().toString(),
          name: email.split('@')[0] || 'User',
          email,
          role: 'staff',
          status: 'active',
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        verifyToken: null,
      };
    }
    const res = await apiClient.post(
      '/auth/login',
      { email, password, ...options },
      { retry: { retries: 1 } }
    );
    const data = res?.data || res;
    return {
      success: Boolean(data?.success ?? true),
      pending: Boolean(data?.pending ?? false),
      user: data.user || {
        id: data.userId || 'me',
        name: data.name || email,
        email,
        role: (data.role || 'staff').toLowerCase(),
        status: data.status || 'active',
      },
      token: data.token || data.accessToken || null,
      refreshToken: data.refreshToken || null,
      verifyToken: data.verifyToken || null,
    };
  }

  async register(userData) {
    if (USE_MOCKS) {
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
      refreshToken: data.refreshToken || null,
      verifyToken: data.verifyToken || null,
    };
  }

  async logout(refreshToken) {
    if (USE_MOCKS) {
      await mockDelay(300);
      return { success: true };
    }
    const res = await apiClient.post('/auth/logout', { refreshToken });
    return res?.data || { success: true };
  }

  async socialLogin(provider) {
    if (USE_MOCKS) {
      await mockDelay(500);
      return {
        success: true,
        user: {
          id: 'u-' + Date.now().toString(),
          name: 'Social User',
          email: 'user@example.com',
          role: 'staff',
        },
        token: 'mock-social-token-' + Date.now(),
      };
    }
    const res = await apiClient.post('/auth/social', { provider });
    const data = res?.data || res;
    return {
      success: true,
      user: data.user || {
        id: 'me',
        name: data.name || 'User',
        email: data.email || 'user@example.com',
        role: (data.role || 'staff').toLowerCase(),
      },
      token: data.token || data.accessToken || null,
    };
  }

  async forgotPassword(email) {
    if (USE_MOCKS) {
      await mockDelay(400);
      return { success: true, message: 'Password reset email sent' };
    }
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res?.data || { success: true };
  }

  async resetPassword(token, newPassword) {
    if (USE_MOCKS) {
      await mockDelay(400);
      return { success: true, message: 'Password reset successful' };
    }
    const res = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return res?.data || { success: true };
  }

  async resetPasswordWithCode(email, code, newPassword) {
    if (USE_MOCKS) {
      await mockDelay(300);
      if (!newPassword || newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters',
        };
      }
      return { success: true };
    }
    const res = await apiClient.post('/auth/reset-password-code', {
      email,
      code,
      newPassword,
    });
    return res?.data || res;
  }

  async verifyResetCode(email, code) {
    if (USE_MOCKS) {
      await mockDelay(200);
      return { success: true, commitToken: 'mock-commit-' + Date.now() };
    }
    const res = await apiClient.post('/auth/verify-reset-code', {
      email,
      code,
    });
    return res?.data || res;
  }

  async changePassword(currentPassword, newPassword) {
    if (USE_MOCKS) {
      await mockDelay(300);
      if (!newPassword || newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters',
        };
      }
      return { success: true };
    }
    const res = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res?.data || res;
  }

  async refreshToken(refreshToken) {
    if (USE_MOCKS) {
      await mockDelay(300);
      return {
        success: true,
        token: 'mock-refreshed-token-' + Date.now(),
        refreshToken: 'mock-rtok-' + Date.now(),
      };
    }
    const res = await apiClient.post('/auth/refresh-token', { refreshToken });
    const data = res?.data || res;
    return {
      success: true,
      token: data.token || data.accessToken || null,
      refreshToken: data.refreshToken || null,
    };
  }

  async verifyEmail(token) {
    if (USE_MOCKS) {
      await mockDelay(300);
      return { success: true };
    }
    const res = await apiClient.post('/auth/verify-email', { token });
    return res?.data || res;
  }

  async resendVerification(email) {
    if (USE_MOCKS) {
      await mockDelay(300);
      return { success: true };
    }
    const res = await apiClient.post('/auth/resend-verification', { email });
    return res?.data || res;
  }
}

export const authService = new AuthService();
export default authService;
