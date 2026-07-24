import * as Sentry from '@sentry/react';
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

// Status code of a failed request, or undefined for a non-HTTP failure (network / timeout / aborted).
// Lets callers branch on the response status without each importing axios and repeating the
// `isAxiosError` guard.
export const httpErrorStatus = (error: unknown): number | undefined =>
  (axios.isAxiosError(error) ? error.response?.status : undefined);

// The human-readable message from the API error body (`{ statusCode, message }`), or `fallback` for a
// non-HTTP failure or a response without one. Lets callers surface the specific server reason (e.g.
// "Supplied role name is not unique") instead of a generic message.
export const httpErrorMessage = (error: unknown, fallback: string): string => {
  const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;

  return typeof message === 'string' ? message : fallback;
};

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
// rotates the cookies) and replay the original request. If /refresh itself returns 401 the session
// is truly over and the original 401 propagates so callers/guards can send the user to /login. Any
// other refresh failure (5xx / network) is transient and propagates as-is (not as a 401), so
// callers can tell a real logout apart from an outage and avoid dropping a still-valid session.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    // A 401 can arrive hours into a still-open tab (the access token is short-lived, but the tab
    // isn't), long after the pageload's trace has any business covering it. Starting a new trace
    // here stops every subsequent /refresh + retry from piling onto that original trace forever —
    // see the Sentry trace analysis for how bad that gets without it.
    return Sentry.startNewTrace(async () => {
      try {
        refreshPromise ??= api
          .post('/refresh')
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          });

        await refreshPromise;
      }
      catch (refreshError) {
        // A 401 from /refresh means the session is truly over — propagate the original 401 so guards
        // clear auth state. Any other failure (5xx / network) is transient: propagate it as-is so the
        // status reflects the outage, not a false 401, and a still-valid session isn't logged out.
        const refreshStatus = httpErrorStatus(refreshError);

        return Promise.reject(refreshStatus === 401 ? error : refreshError);
      }

      return api(original);
    });
  },
);
