import axios from 'axios';

import { API_BASE_URL, APP_HEADER, APP_NAME } from './env.ts';

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Single axios instance for the api-demo REST API.
//
// Auth is cookie-based: the API sets HttpOnly `access_token` / `refresh_token` cookies that
// JS cannot read, so we never touch the tokens directly. `withCredentials` makes the browser
// attach them automatically on every request (the API's CORS config allow-lists this origin
// and sets `credentials: true`).
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    [APP_HEADER]: APP_NAME,
  },
});

// Auth endpoints are never themselves retried through the refresh flow: a 401 from /login is a
// bad-credentials result, and a 401 from /refresh means the session is truly over — retrying
// either would loop. Matched on the exact request path (not a substring) so a future route like
// `/logout-audit` isn't misclassified.
const AUTH_ENDPOINTS = new Set(['/login', '/refresh', '/logout']);

const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;

  const path = url.replace(/[?#].*$/, '');

  return AUTH_ENDPOINTS.has(path);
};

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Single-flight refresh: a burst of concurrent 401s triggers exactly one POST /refresh, and all
// of them await it before replaying.
let refreshPromise: Promise<void> | null = null;

// The access token is short-lived (~5 min). On a 401 we transparently POST /refresh once (which
// rotates the cookies) and replay the original request. If the refresh itself fails, the session
// is over and the original 401 propagates so callers/guards can send the user to /login.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= api
        .post('/refresh')
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });

      await refreshPromise;
    }
    catch {
      return Promise.reject(error);
    }

    return api(original);
  },
);
