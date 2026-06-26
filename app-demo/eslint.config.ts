import baseConfig from '../eslint.config.base.ts';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Shared neostandard + @stylistic base (see ../eslint.config.base.ts), with the
// React-specific plugins layered on top for this front-end package.
export default [
  // Generated CSS-module type declarations (tcm output) — do not lint anywhere.
  { ignores: ['**/*.css.d.ts'] },
  ...baseConfig(),
  // React rules apply to source only — not root tooling configs (vite.config.ts,
  // eslint.config.ts), which export config objects rather than components.
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactRefresh.configs.vite,
  },
];
