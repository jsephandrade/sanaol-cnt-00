import { getAccessToken } from './session';
import { resolveRealtimeBase } from './config';

const realtimeBase = resolveRealtimeBase() || '';

export function connectRealtime({ path = '', onMessage, onStatusChange } = {}) {
  if (!realtimeBase) {
    onStatusChange?.('disabled');
    return { close() {}, isActive: () => false };
  }

  let ws = null;
  let active = true;
  let reconnectAttempts = 0;

  const buildUrl = () => {
    const token = getAccessToken();
    if (!token) return null;
    const base = realtimeBase.replace(/\/+$/, '');
    const suffix = path ? `/${path.replace(/^\/+/, '')}` : '';
    const url = `${base}${suffix}`;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${encodeURIComponent(token)}`;
  };

  const scheduleReconnect = () => {
    reconnectAttempts += 1;
    const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
    onStatusChange?.('reconnecting', { delay });
    setTimeout(() => {
      if (active) {
        connect();
      }
    }, delay);
  };

  const connect = () => {
    if (!active) return;
    const url = buildUrl();
    if (!url) {
      onStatusChange?.('unauthenticated');
      return;
    }
    try {
      ws = new WebSocket(url);
    } catch (err) {
      onStatusChange?.('error', err);
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      reconnectAttempts = 0;
      onStatusChange?.('open');
    };

    ws.onmessage = (event) => {
      let payload = null;
      try {
        payload = JSON.parse(event.data);
      } catch (_err) {
        payload = event.data;
      }
      onMessage?.(payload);
    };

    ws.onerror = (err) => {
      onStatusChange?.('error', err);
    };

    ws.onclose = (event) => {
      if (!active) return;
      if (event?.code === 4401) {
        onStatusChange?.('unauthorized');
        active = false;
        return;
      }
      onStatusChange?.('closed', event);
      scheduleReconnect();
    };
  };

  connect();

  return {
    close() {
      active = false;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.close();
        } catch (_err) {
          // ignore close errors
        }
      }
    },
    isActive: () => Boolean(active && ws && ws.readyState === WebSocket.OPEN),
  };
}
