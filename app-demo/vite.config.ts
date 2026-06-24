import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(resolveBuildId()),
  },
  plugins: [react()],
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
      // Mirrors the `#shared/*` -> `../shared/*.ts` path mapping in tsconfig.app.json
      // so the bundler and the type-checker resolve shared modules identically.
      {
        find: /^#shared\/(.*)$/,
        replacement: `${fileURLToPath(new URL('../shared', import.meta.url))}/$1.ts`,
      },
    ],
  },
});
