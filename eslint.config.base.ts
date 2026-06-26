import neostandard, { plugins } from 'neostandard';

const stylistic = plugins['@stylistic'].configs.customize({
  semi: true,
  arrowParens: true,
});

// Shared ESLint flat-config base for the workspace packages (neostandard +
// @stylistic + the project's custom rule overrides). Each package imports this
// and layers its own package-specific config on top (e.g. React rules in
// app-demo). node_modules/dist are always ignored; pass `ignores` for any
// additional package-specific globs (e.g. generated files).
// neostandard options: https://github.com/neostandard/neostandard
// @stylistic options: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
export default function baseConfig ({ ignores = [] }: { ignores?: string[] } = {}) {
  return [
    ...neostandard({
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        ...ignores,
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
  ];
}
