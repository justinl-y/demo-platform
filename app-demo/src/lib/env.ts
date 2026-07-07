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
