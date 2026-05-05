import path from 'path';
import { defineConfig } from 'vitest/config';

const srcRoot = path.resolve(import.meta.dirname, '../../src');

export default defineConfig({
  resolve: {
    alias: {
      '#lib/': `${srcRoot}/lib/`,
      '#utils/': `${srcRoot}/utils/`,
      '#config/': `${srcRoot}/config/`,
      '#decorators/': `${srcRoot}/decorators/`,
      '#repositories/': `${srcRoot}/repositories/`,
      '#services/': `${srcRoot}/services/`,
    },
  },
  test: {
    include: [
      './integration/**/*.test.ts',
    ],
    reporters: [
      ['tree', { summary: false }],
    ],
  },
});
