import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// Short commit id for the deployed build: GITHUB_SHA in CI, else local git HEAD.
const resolveBuildId = () => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short=7 HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  }
  catch {
    return 'dev';
  }
};

// Doubles as the Sentry `release`, so uploaded source maps link to the runtime `release` set in
// src/lib/sentry.ts (both read this same id).
const buildId = resolveBuildId();

// Source-map upload only runs when a token is present (the deploy sets it) — local/PR builds skip
// it. The plugin reads SENTRY_ORG / SENTRY_PROJECT from the environment.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  build: {
    // Hidden source maps (no sourceMappingURL comment) only when uploading to Sentry; the plugin
    // deletes them after upload so they're never deployed. Off otherwise to keep builds lean.
    sourcemap: sentryAuthToken ? 'hidden' : false,
  },
  plugins: [
    react(),
    ...(sentryAuthToken
      ? [sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: sentryAuthToken,
          release: { name: buildId },
          sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        })]
      : []),
  ],
  server: {
    port: 5173,
    // Fail if the port is taken instead of silently hopping to the next free one.
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: [
      // Mirrors the `#shared/*` -> `../shared/*` path mapping in tsconfig.app.json so the
      // bundler and the type-checker resolve shared modules identically. The extension is
      // left off so each resolver applies its own extension/index resolution (.ts, .tsx,
      // /index.ts, assets) as `shared/` grows.
      {
        find: /^#shared\/(.*)$/,
        replacement: `${fileURLToPath(new URL('../shared', import.meta.url))}/$1`,
      },
    ],
  },
});
