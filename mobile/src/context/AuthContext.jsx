import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_CACHE_KEY,
  clearStoredTokens,
  getCurrentUser,
  getStoredTokens,
  login,
  loginWithGoogle,
  logout,
} from '../api/api';
import { useApiConfig } from './ApiContext';

const AuthContext = createContext({
  user: null,
  initializing: true,
  authError: null,
  isAuthenticated: false,
  signIn: async () => ({ success: false }),
  signInWithGoogle: async () => ({ success: false }),
  signInAsGuest: async () => ({ success: false }),
  signOut: async () => {},
  refreshProfile: async () => null,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  const { setLastError } = useApiConfig() ?? {};

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const tokens = await getStoredTokens();
        if (tokens.accessToken) {
          const profile = await getCurrentUser();
          setUser(profile);
        } else {
          const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          }
        }
      } catch (error) {
        setLastError?.(error);
        await clearStoredTokens();
        setAuthError(error.message || 'Unable to restore session');
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = useCallback(
    async ({ email, password, remember = false }) => {
      setAuthError(null);
      try {
        const result = await login({ email, password, remember });
        setUser(result.user || null);
        return { success: true, user: result.user, meta: result.meta };
      } catch (error) {
        setLastError?.(error);
        const message = error.message || 'Login failed';
        setAuthError(message);
        return { success: false, message };
      }
    },
    [setLastError]
  );

  const signInWithGoogle = useCallback(
    async ({ credential } = {}) => {
      setAuthError(null);
      try {
        const result = await loginWithGoogle({ credential });
        if (!result?.success) {
          const message = result?.message || 'Google login failed';
          setAuthError(message);
          return { success: false, message };
        }
        if (result?.token && result?.user) {
          setUser(result.user);
          return {
            success: true,
            user: result.user,
            pending: Boolean(result.pending),
            tokens: {
              accessToken: result.token,
              refreshToken: result.refreshToken,
            },
            meta: result.meta,
          };
        }
        return {
          success: true,
          pending: true,
          user: result?.user || null,
          verifyToken: result?.verifyToken || null,
          meta: result?.meta,
          message: result?.message,
        };
      } catch (error) {
        setLastError?.(error);
        const message = error?.message || 'Google login failed';
        setAuthError(message);
        return { success: false, message };
      }
    },
    [setLastError]
  );

  const signInAsGuest = useCallback(async () => {
    setAuthError(null);
    try {
      const guestProfile = {
        id: 'guest',
        email: 'guest@local.dev',
        first_name: 'Guest',
        last_name: 'User',
        name: 'Guest User',
        role: 'guest',
        is_guest: true,
        credit_points: 0,
      };
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(guestProfile));
      setUser(guestProfile);
      return { success: true, user: guestProfile, guest: true };
    } catch (error) {
      setLastError?.(error);
      const message =
        error?.message ||
        'Unable to continue without an account. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  }, [setLastError]);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setAuthError(null);
  }, [setLastError]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUser({ forceRefresh: true });
      setUser(profile);
      return profile;
    } catch (error) {
      setLastError?.(error);
      setAuthError(error.message || 'Unable to refresh profile');
      throw error;
    }
  }, [setLastError]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authError,
      isAuthenticated: Boolean(user),
      signIn,
      signInWithGoogle,
      signInAsGuest,
      signOut,
      refreshProfile,
      setUser,
    }),
    [
      user,
      initializing,
      authError,
      signIn,
      signInWithGoogle,
      signInAsGuest,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
