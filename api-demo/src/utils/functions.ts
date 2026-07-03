import crypto from 'crypto';
import path from 'path';

import { Config } from '#config/index';
import { localHost } from './constants.ts';
import { setWithSpan } from '#decorators/with-span';

import type { AddressInfo } from 'net';
import type {
  onRequestHookHandler,
  preHandlerHookHandler,
  RouteHandlerMethod,
} from 'fastify';
import type { PaginatedResult } from '../types/general.ts';

interface RouteProperties<H extends RouteHandlerMethod = RouteHandlerMethod> {
  method: string;
  url: string;
  handler: H;
}

interface OnRequestProperties {
  onRequest: onRequestHookHandler[];
}

interface PreHandlerProperties {
  preHandler: preHandlerHookHandler[];
}

interface RouteSchema {
  route: Record<string, unknown>;
  querystring?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  response: Record<string, unknown>;
}

interface SchemaProperties {
  schema: {
    querystring?: Record<string, unknown>;
    params?: Record<string, unknown>;
    body?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

function getServerDetails(serverAddress: AddressInfo | string | null): string {
  if (serverAddress && typeof serverAddress !== 'string') {
    const {
      port,
      address: ipAddress,
    } = serverAddress;

    return `... Server is listening on ${ipAddress}:${port} ${Config.apiEnv !== 'PROD' ? `(${localHost})` : ''}`;
  }

  if (typeof serverAddress === 'string') return `... Server is listening on ${serverAddress}`;

  return '... Server address information is unavailable';
}

function routePropertiesCore(method: string, url: string, handler: RouteHandlerMethod, permission?: string): RouteProperties {
  return {
    method,
    url,
    handler: setWithSpan(handler.name, handler),
    ...(permission && { config: { permission } }),
  };
}

function routePropertiesOnRequest(onRequest: onRequestHookHandler[]): OnRequestProperties {
  return {
    onRequest,
  };
}

function routePropertiesPrehandler(preHandler: preHandlerHookHandler[]): PreHandlerProperties {
  return {
    preHandler,
  };
}

function routeSchema({
  route, querystring, params, body, response,
}: RouteSchema): SchemaProperties {
  return {
    schema: {
      ...route,
      ...(querystring && { querystring }),
      ...(params && { params }),
      ...(body && { body }),
      response,
    },
  };
}

function cwd(file: string, relativePath: string) {
  return path.resolve(relativePath, file);
}

function paginationOffset(page: number, perPage: number) {
  return (page - 1) * perPage;
}

function paginationPages(total: number | null | undefined, perPage: number) {
  return Math.ceil((total ?? 0) / perPage);
}

interface PaginationOptions {
  page: number;
  perPage: number;
  key: string;
}

// Maps a list query result onto the paginated response envelope. The list queries build
// their rows as a single JSON array under `key` (ordered by the requested sort) and expose
// the pre-pagination row count as `total`; this turns that into { data, pagination }.
// NOTE: Result can be any query shape; we extract the `key` property and `total` field.
function buildPaginatedResult<T>(
  result: unknown,
  {
    page, perPage, key,
  }: PaginationOptions,
): PaginatedResult<T> {
  const data = (((result as Record<PropertyKey, unknown>)?.[key]) ?? []) as T[];
  const pageCount = data.length;
  const total = ((result as { total?: number | null })?.total) ?? 0;
  const pages = paginationPages(total, perPage);

  return {
    data,
    pagination: {
      page,
      per_page: perPage,
      pages,
      count_page: pageCount,
      count_total: total,
    },
  };
}

function randomAlphaNumeric(length: number = 30): string {
  let result = '';

  while (result.length < length) {
    result += crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  return result.slice(0, length);
}

// Deterministic hash for single-use tokens (e.g. invitation tokens) so the hash
// can be looked up by equality. Not for passwords — use bcrypt for those.
function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// Builds a SQL LIKE "contains" pattern (%term%) for a free-text search term,
// escaping the LIKE wildcards (\ % _) so user input matches literally. Returns
// null for an absent or empty term so callers can pass it straight to a nullable
// ILIKE param (a null pattern disables the filter via COALESCE(..., TRUE)).
function likeContains(term: string | null | undefined): string | null {
  if (!term) return null;

  const escaped = term.replace(/[\\%_]/g, '\\$&');

  return `%${escaped}%`;
}

export {
  routePropertiesCore,
  routePropertiesOnRequest,
  routePropertiesPrehandler,
  routeSchema,
  getServerDetails,
  cwd,
  paginationOffset,
  paginationPages,
  buildPaginatedResult,
  randomAlphaNumeric,
  sha256Hex,
  likeContains,
};
