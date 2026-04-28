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
      '**/dist/**',
      '**/*.typed.queries.ts',
    ],
    ts: true,
  }),
  {
    ...stylistic,
    rules: {
      ...stylistic.rules,
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
      '@stylistic/object-curly-newline': ['error', {
        ObjectPattern: {
          multiline: true,
          minProperties: 2,
        },
      }],
    },
  },
];
