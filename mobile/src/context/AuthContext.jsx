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
  USER_CACHE_KEY,
  clearStoredTokens,
  getCurrentUser,
  getStoredTokens,
  login,
  loginWithGoogle,
  logout,
} from '../api/api';

const AuthContext = createContext({
  user: null,
  initializing: true,
  authError: null,
  isAuthenticated: false,
  signIn: async () => ({ success: false }),
  signInWithGoogle: async () => ({ success: false }),
  signOut: async () => {},
  refreshProfile: async () => null,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

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
        await clearStoredTokens();
        setAuthError(error.message || 'Unable to restore session');
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = useCallback(async ({ email, password, remember = false }) => {
    setAuthError(null);
    try {
      const result = await login({ email, password, remember });
      setUser(result.user || null);
      return { success: true, user: result.user, meta: result.meta };
    } catch (error) {
      const message = error.message || 'Login failed';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const signInWithGoogle = useCallback(async ({ credential } = {}) => {
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
      const message = error?.message || 'Google login failed';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUser({ forceRefresh: true });
      setUser(profile);
      return profile;
    } catch (error) {
      setAuthError(error.message || 'Unable to refresh profile');
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authError,
      isAuthenticated: Boolean(user),
      signIn,
      signInWithGoogle,
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
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
