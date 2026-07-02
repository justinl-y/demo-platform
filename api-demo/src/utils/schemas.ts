// Shared JSON-schema fragments for the paginated list-response envelope — the
// schema-side single source of truth for the `{ data: [...], pagination }` shape
// that buildPaginatedResult() produces and every GET list route returns. Mirrors
// PaginatedResult<T> / GetResult in src/types/general.ts; keep the two in sync.

const paginationSchema = {
  type: 'object',
  properties: {
    page: {
      type: 'integer',
    },
    per_page: {
      type: 'integer',
    },
    pages: {
      type: 'integer',
    },
    count_page: {
      type: 'integer',
    },
    count_total: {
      type: 'integer',
    },
  },
  required: ['page', 'per_page', 'pages', 'count_page', 'count_total'],
  additionalProperties: false,
};

// Builds the 200 response schema for a paginated list route: an array of `items`
// under `data`, plus the shared `pagination` envelope. `example` is the per-route
// illustrative payload (Swagger).
function paginatedResponse(items: Record<string, unknown>, example: Record<string, unknown>) {
  return {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items,
        },
        pagination: paginationSchema,
      },
      required: ['data', 'pagination'],
      additionalProperties: false,
      example,
    },
  };
}

// Shared querystring fragments for paginated list routes. `page`/`per_page` are
// identical on every list route; `order` on every sortable one. `sort`/`search`
// vary per route (allowed fields / description), so they are builder functions.
const pageQuery = {
  type: 'string',
  format: 'integer',
  pattern: '^[1-9][0-9]*$',
  default: '1',
  description: 'Page number (default 1)',
};

const perPageQuery = {
  type: 'string',
  format: 'integer',
  pattern: '^([1-9][0-9]?|100)$',
  default: '50',
  description: 'Number of items per page (max 100, default 50)',
};

const orderQuery = {
  type: 'string',
  enum: ['ASC', 'DESC'],
  default: 'ASC',
  description: 'Sort order',
};

function sortQuery(fields: string[], defaultField: string) {
  return {
    type: 'string',
    enum: fields,
    default: defaultField,
    description: 'Field to sort by',
  };
}

function searchQuery(description: string) {
  return {
    type: 'string',
    description,
  };
}

export {
  paginationSchema,
  paginatedResponse,
  pageQuery,
  perPageQuery,
  orderQuery,
  sortQuery,
  searchQuery,
};
