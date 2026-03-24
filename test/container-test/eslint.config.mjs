import neostandard, { plugins } from 'neostandard';

// neostandard options here: https://github.com/neostandard/neostandard?tab=readme-ov-file
// @stylistic customizable options here: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
export default [
  ...neostandard({
    ignores: [
      '**/node_modules/**',
    ],
  }),
  plugins['@stylistic'].configs.customize({
    semi: true,
    arrowParens: true,
  }),
];
