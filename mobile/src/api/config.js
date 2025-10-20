const rawOrigin = (
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000'
).trim();

const normalizedOrigin = rawOrigin.replace(/\/+$/, '');

const rawPrefix =
  process.env.EXPO_PUBLIC_API_PREFIX ||
  process.env.EXPO_PUBLIC_API_REST_PREFIX ||
  '/api/v1';

const normalizedPrefix = rawPrefix.startsWith('/')
  ? rawPrefix
  : `/${rawPrefix}`;

const timeout = Number(process.env.EXPO_PUBLIC_API_TIMEOUT || 15000);

const mockFlag =
  process.env.EXPO_PUBLIC_USE_MOCKS ||
  process.env.EXPO_PUBLIC_API_USE_MOCKS ||
  'false';

const mockDelay = Number(process.env.EXPO_PUBLIC_API_MOCK_DELAY || 350);

export const API_CONFIG = {
  origin: normalizedOrigin,
  restPrefix: normalizedPrefix.replace(/\/+$/, ''),
  timeout: Number.isNaN(timeout) ? 15000 : timeout,
  useMocks: /^true$/i.test(mockFlag),
  mockDelay: Number.isNaN(mockDelay) ? 350 : mockDelay,
};

export const BASE_URL = `${API_CONFIG.origin}${API_CONFIG.restPrefix}`;
