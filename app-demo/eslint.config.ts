import neostandard, { plugins } from 'neostandard';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const stylistic = plugins['@stylistic'].configs.customize({
  semi: true,
  arrowParens: true,
});

// Mirrors api-demo/eslint.config.ts (neostandard + @stylistic), with the
// React-specific plugins layered on top for this front-end package.
// neostandard options: https://github.com/neostandard/neostandard
// @stylistic options: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
export default [
  // Generated CSS-module type declarations (tcm output) — do not lint anywhere.
  { ignores: ['**/*.css.d.ts'] },
  ...neostandard({
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    ts: true,
  }),
  {
    ...stylistic,
    rules: {
      ...stylistic.rules,
      'no-void': ['error', { allowAsStatement: true }],
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
      '@stylistic/object-curly-newline': ['error', {
        ObjectPattern: {
          multiline: true,
          minProperties: 1,
        },
      }],
    },
  },
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
