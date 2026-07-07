// Typed access to the app's Vite env vars (merges into vite/client's ImportMetaEnv).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Sentry — set in .env.stage (deploy) and .env.development (env:local); absent in .env.test.
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
}
