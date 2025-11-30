import Constants from 'expo-constants';

function sanitizeHost(hostUri) {
  if (!hostUri) return null;
  const hostPart = hostUri.split(':')[0];
  if (!hostPart || hostPart === 'localhost' || hostPart === '127.0.0.1') {
    return null;
  }
  return hostPart;
}

function deriveHostFromExpo(extra = {}, defaultPort = '8000') {
  const expoConfig = Constants?.expoConfig || {};
  const hostCandidates = [
    expoConfig.hostUri,
    expoConfig?.expoGo?.debuggerHost,
    extra?.expoGo?.debuggerHost,
    expoConfig?.developer?.host,
  ];

  for (const candidate of hostCandidates) {
    const host = sanitizeHost(candidate);
    if (host) {
      return `http://${host}:${defaultPort}`;
    }
  }
  return null;
}

function ensureTrailing(pathname, suffix) {
  const trimmed = pathname.replace(/\/+$/, '');
  return `${trimmed}${suffix}`;
}

export function resolveApiBase() {
  const extra = Constants?.expoConfig?.extra || {};
  if (process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (extra.apiUrl) {
    return extra.apiUrl;
  }
  const derived = deriveHostFromExpo(extra, extra.apiPort || '8000');
  if (derived) {
    return ensureTrailing(derived, '/api');
  }
  return null;
}

export function resolveRealtimeBase() {
  const extra = Constants?.expoConfig?.extra || {};
  if (process.env?.EXPO_PUBLIC_REALTIME_URL) {
    return process.env.EXPO_PUBLIC_REALTIME_URL;
  }
  if (extra.realtimeUrl) {
    return extra.realtimeUrl;
  }
  const apiBase = resolveApiBase();
  if (!apiBase) return null;
  try {
    const parsed = new URL(apiBase);
    parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    const withoutTrailing = parsed.pathname.replace(/\/+$/, '');
    if (withoutTrailing.endsWith('/api')) {
      parsed.pathname = withoutTrailing.replace(/\/api$/, '/ws/events');
    } else {
      parsed.pathname = `${withoutTrailing}/ws/events`;
    }
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}
