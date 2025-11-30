import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'technomart/session/accessToken';
const REFRESH_TOKEN_KEY = 'technomart/session/refreshToken';
const USER_KEY = 'technomart/session/user';

let sessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

let hydrated = false;
let secureStoreAvailable = null;

const listeners = new Set();

function safeParse(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function notify() {
  const snapshot = { ...sessionState, hydrated };
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch (_err) {
      // Ignore listener errors to keep others alive.
    }
  }
}

async function checkSecureStoreAvailability() {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }
  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }
  return secureStoreAvailable;
}

async function readToken(key) {
  const useSecureStore = await checkSecureStoreAvailability();
  if (useSecureStore) {
    const value = await SecureStore.getItemAsync(key);
    if (value) {
      // Ensure plaintext fallback is cleared if tokens were previously stored there.
      await AsyncStorage.removeItem(key).catch(() => {});
      return value;
    }
    const fallback = await AsyncStorage.getItem(key);
    if (fallback) {
      try {
        await SecureStore.setItemAsync(key, fallback, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
        });
        await AsyncStorage.removeItem(key).catch(() => {});
        return fallback;
      } catch {
        return fallback;
      }
    }
    return null;
  }
  return AsyncStorage.getItem(key);
}

async function writeToken(key, value) {
  const useSecureStore = await checkSecureStoreAvailability();
  if (value) {
    if (useSecureStore) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      await AsyncStorage.removeItem(key).catch(() => {});
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } else if (useSecureStore) {
    await SecureStore.deleteItemAsync(key).catch(() => {});
    await AsyncStorage.removeItem(key).catch(() => {});
  } else {
    await AsyncStorage.removeItem(key).catch(() => {});
  }
}

async function persistUser(user) {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY).catch(() => {});
    return;
  }
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore persistence errors; session still lives in memory.
  }
}

async function hydrateSession() {
  try {
    const [accessToken, refreshToken, userJson] = await Promise.all([
      readToken(ACCESS_TOKEN_KEY),
      readToken(REFRESH_TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    sessionState = {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      user: safeParse(userJson),
    };
  } catch {
    sessionState = {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  } finally {
    hydrated = true;
    notify();
  }
  return sessionState;
}

const hydrationPromise = hydrateSession();

function updateSession(partial = {}) {
  sessionState = {
    ...sessionState,
    accessToken: partial.accessToken !== undefined ? partial.accessToken : sessionState.accessToken,
    refreshToken:
      partial.refreshToken !== undefined ? partial.refreshToken : sessionState.refreshToken,
    user: partial.user !== undefined ? partial.user : sessionState.user,
  };
  notify();
}

export function ensureSessionHydrated() {
  return hydrationPromise;
}

export function isSessionHydrated() {
  return hydrated;
}

export function setSession(partial = {}) {
  updateSession(partial);
  const { accessToken, refreshToken, user } = sessionState;
  writeToken(ACCESS_TOKEN_KEY, accessToken || null).catch(() => {});
  writeToken(REFRESH_TOKEN_KEY, refreshToken || null).catch(() => {});
  persistUser(user).catch(() => {});
}

export function setSessionTokens({ accessToken, refreshToken }) {
  updateSession({
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
  });
  writeToken(ACCESS_TOKEN_KEY, accessToken || null).catch(() => {});
  writeToken(REFRESH_TOKEN_KEY, refreshToken || null).catch(() => {});
}

export function setSessionUser(user) {
  updateSession({ user: user ?? null });
  persistUser(user ?? null).catch(() => {});
}

export function clearSession() {
  sessionState = {
    accessToken: null,
    refreshToken: null,
    user: null,
  };
  notify();
  writeToken(ACCESS_TOKEN_KEY, null).catch(() => {});
  writeToken(REFRESH_TOKEN_KEY, null).catch(() => {});
  persistUser(null).catch(() => {});
}

export function getAccessToken() {
  return sessionState.accessToken;
}

export function getRefreshToken() {
  return sessionState.refreshToken;
}

export function getSessionUser() {
  return sessionState.user;
}

export function getSessionSnapshot() {
  return { ...sessionState, hydrated };
}

export function hasSession() {
  return Boolean(sessionState.accessToken);
}

export function onSessionChange(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }
  listeners.add(listener);
  try {
    listener({ ...sessionState, hydrated });
  } catch {
    // ignore initial listener errors
  }
  return () => {
    listeners.delete(listener);
  };
}
