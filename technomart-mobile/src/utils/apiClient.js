import { apiClient as sharedClient } from '../../../shared/api';
import { getAccessToken, onSessionChange, clearSession } from './session';
import { resolveApiBase } from './config';

const baseCandidate = resolveApiBase();

if (!baseCandidate) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not configured. Set it in .env.<env> or expo extra.apiUrl.'
  );
}

const trimmed = baseCandidate.replace(/\/+$/, '');
sharedClient.baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

sharedClient.setAuthTokenProvider(() => getAccessToken() || null);

sharedClient.onUnauthorized = () => {
  clearSession();
};

onSessionChange(({ accessToken }) => {
  sharedClient.setAuthToken(accessToken || null);
});

export default sharedClient;
