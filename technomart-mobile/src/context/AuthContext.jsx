import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ensureSessionHydrated,
  getSessionSnapshot,
  isSessionHydrated,
  onSessionChange,
  setSessionUser,
} from '../utils/session';
import {
  refreshSession,
  resendLoginOtp,
  resendVerification as resendVerificationEmail,
  signIn,
  signOut,
  verifyLoginOtp,
} from '../utils/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const initialSnapshot = getSessionSnapshot();
  const [hydrated, setHydrated] = useState(initialSnapshot.hydrated ?? isSessionHydrated());
  const [session, setSession] = useState({
    accessToken: initialSnapshot.accessToken || null,
    refreshToken: initialSnapshot.refreshToken || null,
    user: initialSnapshot.user || null,
  });
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    ensureSessionHydrated()
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });

    const unsubscribe = onSessionChange((next) => {
      if (cancelled) return;
      setSession({
        accessToken: next.accessToken || null,
        refreshToken: next.refreshToken || null,
        user: next.user || null,
      });
      if (!hydrated && next.hydrated) {
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // We intentionally run this effect only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAuthAction = useCallback(async (fn) => {
    setAuthenticating(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setAuthenticating(false);
    }
  }, []);

  const handleSignIn = useCallback(
    (email, password, options) => runAuthAction(() => signIn(email, password, options)),
    [runAuthAction]
  );

  const handleVerifyOtp = useCallback(
    (payload) => runAuthAction(() => verifyLoginOtp(payload)),
    [runAuthAction]
  );

  const handleResendOtp = useCallback(
    (payload) => runAuthAction(() => resendLoginOtp(payload)),
    [runAuthAction]
  );

  const handleRefresh = useCallback(
    (token) => runAuthAction(() => refreshSession(token)),
    [runAuthAction]
  );

  const handleResendVerification = useCallback(
    (payload) => {
      const email = typeof payload === 'string' ? payload : payload?.email;
      return runAuthAction(() => resendVerificationEmail(email));
    },
    [runAuthAction]
  );

  const handleSignOut = useCallback(
    (options) => runAuthAction(() => signOut(options)),
    [runAuthAction]
  );

  const contextValue = useMemo(
    () => ({
      hydrated,
      authenticating,
      loading: !hydrated,
      error,
      session,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      isAuthenticated: Boolean(session.accessToken),
      signIn: handleSignIn,
      verifyLoginOtp: handleVerifyOtp,
      resendLoginOtp: handleResendOtp,
      resendVerification: handleResendVerification,
      refreshSession: handleRefresh,
      signOut: handleSignOut,
      clearError: () => setError(null),
      setSessionUser,
    }),
    [
      hydrated,
      authenticating,
      error,
      session,
      handleSignIn,
      handleVerifyOtp,
      handleResendOtp,
      handleResendVerification,
      handleRefresh,
      handleSignOut,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
