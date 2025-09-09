// AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import authService from '@/api/services/authService';
import apiClient from '@/api/client';

// Context shape
const AuthContext = createContext({
  user: null,
  token: null,
  // actions
  login: async () => false,
  socialLogin: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshToken: async () => false,
  // role/permission helpers
  hasRole: () => false,
  hasAnyRole: () => false,
  can: () => true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('auth_token') || null;
    } catch {
      return null;
    }
  });
  const [refreshTokenValue, setRefreshTokenValue] = useState(() => {
    try {
      return localStorage.getItem('refresh_token') || null;
    } catch {
      return null;
    }
  });

  // Keep a ref for apiClient token provider to avoid stale closures
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Keep a ref for refresh function to avoid exhaustive-deps churn
  const refreshRef = useRef(null);

  // Configure apiClient once
  useEffect(() => {
    // Dynamic token provider and 401 handler
    apiClient.setAuthTokenProvider(() => tokenRef.current);
    let refreshing = false;
    apiClient.onUnauthorized = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const ok = await (refreshRef.current
          ? refreshRef.current()
          : Promise.resolve(false));
        if (!ok) {
          setUser(null);
          setToken(null);
          try {
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
          } catch {}
        }
      } finally {
        refreshing = false;
      }
    };
  }, []);

  // Initialize apiClient header from persisted token
  useEffect(() => {
    apiClient.setAuthToken(token);
  }, [token]);

  const persistAuth = useCallback(
    (nextUser, nextToken, nextRefreshToken = null) => {
      setUser(nextUser);
      setToken(nextToken);
      setRefreshTokenValue(nextRefreshToken);
      try {
        localStorage.setItem('user', JSON.stringify(nextUser));
        if (nextToken) {
          localStorage.setItem('auth_token', nextToken);
        } else {
          localStorage.removeItem('auth_token');
        }
        if (nextRefreshToken) {
          localStorage.setItem('refresh_token', nextRefreshToken);
        } else {
          localStorage.removeItem('refresh_token');
        }
      } catch {}
    },
    []
  );

  const login = useCallback(
    async (email, password, options = {}) => {
      try {
        const res = await authService.login(email, password, options);
        if (res?.success) {
          persistAuth(res.user, res.token || null, res.refreshToken || null);
        }
        return res;
      } catch (err) {
        return { success: false, error: err?.message || 'Login failed' };
      }
    },
    [persistAuth]
  );

  const socialLogin = useCallback(
    async (provider) => {
      try {
        const res = await authService.socialLogin(provider);
        if (res?.success) {
          persistAuth(res.user, res.token || null, res.refreshToken || null);
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    },
    [persistAuth]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      try {
        const res = await authService.loginWithGoogle(credential);
        if (!res?.success) return { success: false };
        // Only persist when we actually have a token (approved users)
        if (res.token) {
          persistAuth(res.user, res.token, res.refreshToken || null);
        }
        return res; // { success, pending?, user, token?, verifyToken? }
      } catch (err) {
        return { success: false, error: err?.message || 'Login failed' };
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const res = await authService.register(userData);
        // Do not persist during pending; page will route to verify
        if (res?.success && res?.token) {
          persistAuth(res.user, res.token, res.refreshToken || null);
        }
        return res;
      } catch (err) {
        return { success: false, error: err?.message || 'Registration failed' };
      }
    },
    [persistAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout(refreshTokenValue);
    } catch {}
    persistAuth(null, null, null);
  }, [persistAuth, refreshTokenValue]);

  const refreshToken = useCallback(async () => {
    try {
      const res = await authService.refreshToken(refreshTokenValue);
      if (res?.success && res?.token) {
        setToken(res.token);
        setRefreshTokenValue(res.refreshToken || null);
        try {
          localStorage.setItem('auth_token', res.token);
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
          }
        } catch {}
        return true;
      }
      return false;
    } catch (err) {
      await logout();
      return false;
    }
  }, [logout, refreshTokenValue]);

  // keep latest refresh function in a ref for onUnauthorized
  useEffect(() => {
    refreshRef.current = refreshToken;
  }, [refreshToken]);

  // Role/permission helpers
  const hasRole = (role) =>
    (user?.role || '').toLowerCase() === (role || '').toLowerCase();
  const hasAnyRole = (roles = []) => roles.some((r) => hasRole(r));
  const can = (permission) => {
    if (!permission) return true;
    const perms = user?.permissions || [];
    return (
      perms.includes(permission) || perms.includes('*') || hasRole('admin')
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        socialLogin,
        loginWithGoogle,
        register,
        logout,
        refreshToken,
        hasRole,
        hasAnyRole,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
