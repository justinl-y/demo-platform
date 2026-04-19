import type {
  SqlParams,
} from '../types/database.ts';

interface NumericQuery {
  sql: string;
  values: unknown[];
}

type QueryFn = ((...args: unknown[]) => unknown) & {
  patched?: boolean;
};

interface QueryClient {
  query: QueryFn;
}

interface QueryConfig {
  text: unknown;
  values: unknown;
}

const tokenPattern = /\$[a-zA-Z]([a-zA-Z0-9_]*)\b/g;

function isNamedParameters(value: unknown): value is SqlParams {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isQueryConfig(value: unknown): value is QueryConfig {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  return 'text' in value && 'values' in value;
}

function numericFromNamed(sql: string, parameters: SqlParams): NumericQuery {
  const objTokens = Object.keys(parameters);
  const sqlTokens = [...new Set((sql.match(tokenPattern) ?? []).map((token) => token.substring(1)))];
  const unmatchedTokens = sqlTokens.filter((t) => !objTokens.includes(t));

  if (unmatchedTokens.length) {
    throw new Error(`Missing Parameters: ${unmatchedTokens.join(', ')}`);
  }

  const fillTokens = objTokens.filter((t) => sqlTokens.includes(t)).sort();
  const fillValues = fillTokens.map((token) => parameters[token]);
  const interpolatedSql = fillTokens.reduce((partiallyInterpolated, token, index) => {
    return partiallyInterpolated.replace(new RegExp(`\\$${token}\\b`, 'g'), `$${index + 1}`);
  }, sql);

  return {
    sql: interpolatedSql,
    values: fillValues,
  };
}

function pgPatch(client: QueryClient): QueryClient {
  const originalQuery = client.query;

  if (originalQuery.patched) return client;

  const boundOriginalQuery = originalQuery.bind(client) as QueryFn;

  // Supports query(config) and query(text, values, callback) calling styles.
  const patchedQuery: QueryFn = (...args: unknown[]) => {
    if (isQueryConfig(args[0]) && typeof args[0].text === 'string' && isNamedParameters(args[0].values)) {
      const transformed = numericFromNamed(args[0].text, args[0].values);

      args[0].text = transformed.sql;
      args[0].values = transformed.values;
    }

    if (typeof args[0] === 'string' && isNamedParameters(args[1])) {
      const transformed = numericFromNamed(args[0], args[1]);

      return boundOriginalQuery(transformed.sql, transformed.values, ...args.slice(2));
    }

    return boundOriginalQuery(...args);
  };

  patchedQuery.patched = true;
  client.query = patchedQuery;

  return client;
}

export {
  pgPatch,
};
