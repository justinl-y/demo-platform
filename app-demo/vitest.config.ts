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
    // Match api-demo's output style: a full tree of describe/test names, no trailing summary block.
    reporters: [
      ['tree', { summary: false }],
    ],
  },
});
