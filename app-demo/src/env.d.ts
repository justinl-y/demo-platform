// Typed access to the app's Vite env vars (merges into vite/client's ImportMetaEnv).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Sentry — set in .env.stage (deploy) and .env.development (env:local); absent in .env.test.
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
}

// Build-time constant injected by Vite `define` (see vite.config.ts). Declared at the top level
// (not inside `declare global`) to keep this file a script, so the ImportMetaEnv augmentation above
// stays a global merge rather than becoming a module-local interface.
declare const __BUILD_ID__: string;
