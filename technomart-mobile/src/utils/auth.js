import { callOperation } from '../../../shared/api';
import { setSessionTokens, setSessionUser, clearSession, getRefreshToken } from './session';

const DEFAULT_RETRY = { retries: 1 };

function unwrap(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

function normalizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const employeeId = rawUser.employeeId ?? rawUser.employee_id ?? rawUser.employee?.id ?? null;
  return {
    ...rawUser,
    employeeId,
  };
}

function syncSession(payload) {
  if (!payload || typeof payload !== 'object') {
    return;
  }
  if (payload.user) {
    setSessionUser(normalizeUser(payload.user));
  }
  const accessToken = payload.token || payload.accessToken || null;
  const refreshToken = payload.refreshToken || payload.refresh_token || null;
  if (accessToken || refreshToken) {
    setSessionTokens({ accessToken, refreshToken });
  }
}

export async function signIn(email, password, options = {}) {
  const payload = {
    email: (email || '').trim().toLowerCase(),
    password,
    remember: Boolean(options.remember),
  };
  const res = await callOperation('auth_login', {
    data: payload,
    config: { retry: DEFAULT_RETRY },
  });
  const data = unwrap(res) || {};
  syncSession(data);
  return data;
}

export async function verifyLoginOtp({ email, otpToken, code, remember } = {}) {
  const payload = {
    email: (email || '').trim().toLowerCase(),
    otpToken,
    code,
    remember: Boolean(remember),
  };
  const res = await callOperation('auth_verifyLoginOtp', {
    data: payload,
    config: { retry: DEFAULT_RETRY },
  });
  const data = unwrap(res) || {};
  syncSession(data);
  return data;
}

export async function resendLoginOtp({ email, otpToken, remember } = {}) {
  const payload = {
    email: (email || '').trim().toLowerCase(),
    otpToken,
    remember: Boolean(remember),
  };
  const res = await callOperation('auth_resendLoginOtp', {
    data: payload,
    config: { retry: DEFAULT_RETRY },
  });
  const data = unwrap(res) || {};
  if (data.user) {
    setSessionUser(normalizeUser(data.user));
  }
  return data;
}

export async function refreshSession(refreshToken) {
  const token = refreshToken || getRefreshToken();
  if (!token) {
    throw new Error('No refresh token available');
  }
  const res = await callOperation('auth_refreshToken', {
    data: { refreshToken: token },
    config: { retry: DEFAULT_RETRY },
  });
  const data = unwrap(res) || {};
  syncSession(data);
  return data;
}

export async function signOut(options = {}) {
  const token = options.refreshToken || getRefreshToken();
  try {
    await callOperation('auth_logout', {
      data: token ? { refreshToken: token } : {},
      config: { retry: DEFAULT_RETRY },
    });
  } finally {
    clearSession();
  }
}

export async function register(nameOrPayload, emailArg, passwordArg, phoneArg) {
  const base =
    typeof nameOrPayload === 'object' && nameOrPayload !== null
      ? nameOrPayload
      : {
          name: nameOrPayload,
          email: emailArg,
          password: passwordArg,
          phone: phoneArg,
        };
  const payload = {
    name: (base.name || '').trim(),
    email: (base.email || '').trim().toLowerCase(),
    password: base.password,
    phone: base.phone || '',
  };
  const res = await callOperation('auth_register', {
    data: payload,
    config: { retry: DEFAULT_RETRY },
  });
  const data = unwrap(res) || {};
  if (data.user) {
    setSessionUser(normalizeUser(data.user));
  }
  return data;
}

export async function requestPasswordReset(email) {
  const payload = { email: (email || '').trim().toLowerCase() };
  const res = await callOperation('auth_requestPasswordReset', {
    data: payload,
    config: { retry: DEFAULT_RETRY },
  });
  return unwrap(res) || { success: true };
}

export async function resendVerification(emailOrPayload) {
  const normalized = typeof emailOrPayload === 'string' ? emailOrPayload : emailOrPayload?.email;
  const payload = { email: (normalized || '').trim().toLowerCase() };
  if (!payload.email) {
    throw new Error('Email is required to resend verification.');
  }
  const res = await callOperation('auth_resendVerification', {
    data: payload,
    config: { retry: DEFAULT_RETRY },
  });
  return unwrap(res) || { success: true };
}
