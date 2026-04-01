import _ from 'lodash';

type NamedParameters = Record<string, unknown>;

type NumericQuery = {
  sql: string;
  values: unknown[];
};

type QueryFn = ((...args: unknown[]) => unknown) & {
  patched?: boolean;
};

type QueryClient = {
  query: QueryFn;
};

type QueryConfig = {
  text: unknown;
  values: unknown;
};

const tokenPattern = /\$[a-zA-Z]([a-zA-Z0-9_]*)\b/g;

function isNamedParameters(value: unknown): value is NamedParameters {
  return _.isPlainObject(value);
};

function isQueryConfig(value: unknown): value is QueryConfig {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  return 'text' in value && 'values' in value;
};

function numericFromNamed(sql: string, parameters: NamedParameters): NumericQuery {
  const objTokens = Object.keys(parameters);
  const sqlTokens = _.uniq((sql.match(tokenPattern) ?? []).map((token) => token.substring(1)));
  const fillTokens = _.intersection(objTokens, sqlTokens).sort();
  const fillValues = fillTokens.map((token) => parameters[token]);
  const unmatchedTokens = _.difference(sqlTokens, objTokens);
  const missing = unmatchedTokens.join(', ');
  const interpolatedSql = _.reduce(fillTokens, (partiallyInterpolated, token, index) => {
    const replaceAllPattern = new RegExp(`\\$${token}\\b`, 'g');

    // PostgreSQL parameters are 1-indexed.
    return partiallyInterpolated.replace(replaceAllPattern, `$${index + 1}`);
  }, sql);

  if (unmatchedTokens.length) {
    throw new Error(`Missing Parameters: ${missing}`);
  }

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
    if (isQueryConfig(args[0]) && _.isString(args[0].text) && isNamedParameters(args[0].values)) {
      const transformed = numericFromNamed(args[0].text, args[0].values);

      args[0].text = transformed.sql;
      args[0].values = transformed.values;
    }

    if (_.isString(args[0]) && isNamedParameters(args[1])) {
      const cb = args.length === 3 ? args[2] : undefined;
      const transformed = numericFromNamed(args[0], args[1]);

      return boundOriginalQuery(transformed.sql, transformed.values, cb);
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
