import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfigPath = path.join(__dirname, 'app.json');
const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'));

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const entries = {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sepIndex = line.indexOf('=');
    if (sepIndex === -1) continue;
    const key = line.slice(0, sepIndex).trim();
    if (!key) continue;
    const rawValue = line.slice(sepIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    entries[key] = value;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
  return entries;
}

function deriveRealtimeUrl(apiUrl) {
  if (!apiUrl) return null;
  try {
    const parsed = new URL(apiUrl);
    parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    const trimmedPath = parsed.pathname.replace(/\/+$/, '');
    if (trimmedPath.endsWith('/api')) {
      parsed.pathname = trimmedPath.replace(/\/api$/, '/ws/events');
    } else {
      parsed.pathname = `${trimmedPath}/ws/events`;
    }
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function configureExpo({ config }) {
  const runtimeEnv =
    process.env.EXPO_APP_ENV ||
    process.env.APP_ENV ||
    process.env.EAS_BUILD_PROFILE ||
    process.env.NODE_ENV ||
    'development';

  const envFilePath = path.join(__dirname, `.env.${runtimeEnv}`);
  loadEnvFile(envFilePath);

  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    config?.extra?.apiUrl ||
    baseConfig?.expo?.extra?.apiUrl ||
    null;

  if (!process.env.EXPO_PUBLIC_API_URL && apiUrl) {
    process.env.EXPO_PUBLIC_API_URL = apiUrl;
  }

  const realtimeUrl =
    process.env.EXPO_PUBLIC_REALTIME_URL ||
    config?.extra?.realtimeUrl ||
    baseConfig?.expo?.extra?.realtimeUrl ||
    deriveRealtimeUrl(apiUrl) ||
    null;

  if (!process.env.EXPO_PUBLIC_REALTIME_URL && realtimeUrl) {
    process.env.EXPO_PUBLIC_REALTIME_URL = realtimeUrl;
  }

  const mergedExtra = {
    ...(baseConfig?.expo?.extra || {}),
    ...(config?.extra || {}),
    apiUrl,
    realtimeUrl,
    runtimeEnv,
  };

  return {
    ...(baseConfig?.expo || {}),
    ...config,
    extra: mergedExtra,
  };
}

