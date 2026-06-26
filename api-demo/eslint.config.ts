import baseConfig from '../eslint.config.base.ts';

// Shared neostandard + @stylistic base (see ../eslint.config.base.ts). The only
// package-specific addition is ignoring pgtyped-generated query files.
export default baseConfig({ ignores: ['**/*.typed.queries.ts'] });
