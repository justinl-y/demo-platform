import neostandard, { plugins } from 'neostandard';

const stylistic = plugins['@stylistic'].configs.customize({
  semi: true,
  arrowParens: true,
});

// neostandard options here: https://github.com/neostandard/neostandard?tab=readme-ov-file
// @stylistic customizable options here: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
export default [
  ...neostandard({
    ignores: [
      '**/node_modules/**',
      '**/*.typed.queries.ts',
    ],
    ts: true,
  }),
  {
    ...stylistic,
    rules: {
      ...stylistic.rules,
      '@stylistic/no-extra-semi': 'error',
    },
  },
];
