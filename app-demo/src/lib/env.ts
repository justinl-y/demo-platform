// Base URL of the api-demo REST API, from VITE_API_URL:
//   - dev (env:local / env:test): from the matching .env file, defaulting to the local API on :6662
//   - deploy build (`vite build --mode stage`): required (set in .env.stage) — a deployed bundle must
//     never fall back to a localhost origin, so we fail rather than ship one. `import.meta.env.PROD`
//     is a build-time constant (true for the deploy build), so the dev branch (and its localhost
//     string) is dropped from the output.
function resolveApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;

  if (import.meta.env.PROD) {
    if (!url) throw new Error('VITE_API_URL must be set for the deploy build (see app-demo/.env.stage).');

    return url;
  }

  return url ?? 'http://localhost:6662';
}

export const API_BASE_URL = resolveApiBaseUrl();

// The API's CORS config allow-lists this custom header; sending it identifies the caller.
export const APP_HEADER = 'X-Demo-Application';
export const APP_NAME = 'app-demo';

// Human label for the current environment, shown after the product name in the UI (e.g. "Demo
// Platform (Stage)"). Derived from the Vite `--mode` so no extra env var is needed; any unmapped
// mode — production included — yields no label, so prod shows just "Demo Platform" (fail-safe: an
// unknown environment never leaks a label).
const ENV_LABELS: Record<string, string> = {
  development: 'Local',
  test: 'Test',
  stage: 'Stage',
};

export const ENV_LABEL = ENV_LABELS[import.meta.env.MODE] ?? '';

// Product name shown in the UI header / browser tab, suffixed with the environment in parentheses
// outside production (e.g. "Demo Platform (Stage)"); prod shows just the name.
export const APP_DISPLAY_NAME = 'Demo Platform';
export const APP_TITLE = ENV_LABEL ? `${APP_DISPLAY_NAME} (${ENV_LABEL})` : APP_DISPLAY_NAME;

// True only for the deployed builds (stage/prod, i.e. `vite build`), false in the local/test dev
// servers. `import.meta.env.PROD` is a build-time constant, so anything gated on it is tree-shaken
// out of the dev bundle.
export const IS_DEPLOYED_ENV = import.meta.env.PROD;

// Short commit id of the running build — GITHUB_SHA in CI, local git HEAD otherwise (see
// vite.config.ts, which also feeds it to the Sentry release).
export const BUILD_ID = __BUILD_ID__;

// Value shown in the login build footer: the commit id on deployed builds (stage/prod), or the
// environment name in the local/test dev servers, where a commit id isn't meaningful.
export const BUILD_LABEL = IS_DEPLOYED_ENV ? BUILD_ID : ENV_LABEL;
