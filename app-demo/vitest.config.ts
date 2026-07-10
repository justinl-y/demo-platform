import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// Inherit the app's build config (React plugin, #shared alias, defines) so tests resolve modules
// exactly as the bundler does — then override only what's test-specific. Importing vite.config runs
// its one-off resolveBuildId() git call, which is harmless (it has a 'dev' fallback); __BUILD_ID__
// is re-pinned to 'test' below so the value stays deterministic in tests.
export default mergeConfig(viteConfig, {
  define: {
    __BUILD_ID__: JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/lib/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    // Perf: run files in worker threads (cheaper spin-up than forks) and skip per-file isolation, so
    // the heavy imports (antd) and the jsdom environment load once per worker instead of once per
    // file, and zxcvbn's memoised factory is reused. Safe because setup.ts resets all cross-test
    // state each test (MSW handlers, localStorage, RTL cleanup) and renderApp builds a fresh
    // QueryClient + router per call. If ordering-dependent flakiness ever appears, drop `isolate`.
    pool: 'threads',
    isolate: false,
    // Match api-demo's output style: a full tree of describe/test names, no trailing summary block.
    reporters: [
      ['tree', { summary: false }],
    ],
  },
});
