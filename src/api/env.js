/* global __APP_VITE_ENV__ */

const GLOBAL_ENV_KEY = '__SANAOL_RUNTIME_ENV__';

const parsedDefinedEnv =
  typeof __APP_VITE_ENV__ !== 'undefined'
    ? parseDefinedEnv(__APP_VITE_ENV__)
    : null;

function parseDefinedEnv(value) {
  if (value && typeof value === 'object') {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

export function setRuntimeEnv(env) {
  if (!env || typeof globalThis === 'undefined') return;
  try {
    globalThis[GLOBAL_ENV_KEY] = env;
  } catch {
    // Ignore if we cannot assign (e.g., locked globalThis)
  }
}

export function getRuntimeEnv() {
  if (typeof globalThis !== 'undefined' && globalThis[GLOBAL_ENV_KEY]) {
    return globalThis[GLOBAL_ENV_KEY];
  }
  if (parsedDefinedEnv) {
    return parsedDefinedEnv;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  return {};
}

export function getEnvValue(keys, fallback = undefined) {
  const env = getRuntimeEnv() || {};
  const list = Array.isArray(keys) ? keys : [keys];
  for (const key of list) {
    if (!key) continue;
    const value = env[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

export function getEnvBoolean(keys, fallback = false) {
  const value = getEnvValue(keys, undefined);
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return fallback;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return true;
  }
  return fallback;
}

export function resolveApiBase(defaultBase = '/api') {
  const candidate = getEnvValue(
    ['VITE_API_BASE_URL', 'EXPO_PUBLIC_API_URL', 'API_BASE_URL'],
    null
  );
  return candidate || defaultBase;
}

export function resolveMediaBase(defaultBase = '') {
  return (
    getEnvValue(
      ['VITE_MEDIA_BASE_URL', 'EXPO_PUBLIC_MEDIA_BASE_URL', 'MEDIA_BASE_URL'],
      defaultBase
    ) || defaultBase
  );
}

export const RUNTIME_ENV_GLOBAL_KEY = GLOBAL_ENV_KEY;
