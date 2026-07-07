import * as Sentry from '@sentry/react';

import { API_BASE_URL } from './env.ts';

import type { InternalUser } from '#shared/types';

type SentryRouter = Parameters<typeof Sentry.tanstackRouterBrowserTracingIntegration>[0];

// Per-environment trace sampling, mirroring api-demo's sentryConfig (LOCAL full, STAGE/PROD low).
const tracesSampleRateByEnv: Record<string, number> = {
  LOCAL: 1,
  TEST: 0,
  STAGE: 0.2,
  PROD: 0.1,
};

// Initialize Sentry as early as possible (called from main.tsx before render). No-ops without a
// VITE_SENTRY_DSN: env:local (.env.development) and the stage build (.env.stage) carry one — so
// they report, mirroring the API's LOCAL/STAGE — while env:test omits it, leaving Sentry off there.
export const initSentry = (router: SentryRouter): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE;

  Sentry.init({
    dsn,
    environment,
    release: __BUILD_ID__,
    integrations: [
      // Page-load + navigation performance (Web Vitals), with TanStack Router route names.
      Sentry.tanstackRouterBrowserTracingIntegration(router),
    ],
    tracesSampleRate: tracesSampleRateByEnv[environment] ?? 0.1,
    // Attach distributed-trace headers only to our own API (cross-subdomain), so a trace links the
    // SPA to api-demo. Requires the API's CORS to allow the `sentry-trace` + `baggage` headers.
    tracePropagationTargets: [API_BASE_URL],
    // Keep third-party / browser-extension noise (e.g. LastPass background errors) out of Sentry.
    denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//],
    // Data minimization. `httpBodies: []` keeps request/response bodies — notably the POST /login
    // password — out of Sentry; user id/email are still sent explicitly via setSentryUser. The other
    // categories are off too (no cookies / headers / query params / auto IP). This is the explicit,
    // future-proof form of the now-deprecated `sendDefaultPii: false` (removed in Sentry v11), whose
    // defaults these already matched — set here so nothing is silently collected.
    dataCollection: {
      userInfo: false,
      httpBodies: [],
      cookies: false,
      httpHeaders: {
        request: false,
        response: false,
      },
      queryParams: false,
    },
  });
};

// Correlate front-end events with the same user the API reports (api-demo's setSentryUser), so a
// client error and the API error it triggered share one identity.
export const setSentryUser = (user: Pick<InternalUser, 'user_id' | 'email'>): void => {
  Sentry.setUser(
    {
      id: user.user_id,
      email: user.email,
    },
  );
};

export const clearSentryUser = (): void => {
  Sentry.setUser(null);
};
