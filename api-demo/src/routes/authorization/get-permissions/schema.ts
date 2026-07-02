import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Get one or more permissions',
  description: 'Returns one or more permissions',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    order: {
      type: 'string',
      enum: [
        'ASC',
        'DESC',
      ],
      default: 'ASC',
      description: 'Sort order',
    },
    page: {
      type: 'string',
      format: 'integer',
      pattern: '^[1-9][0-9]*$',
      default: '1',
      description: 'Page number (default 1)',
    },
    per_page: {
      type: 'string',
      format: 'integer',
      pattern: '^([1-9][0-9]?|100)$',
      default: '50',
      description: 'Number of items per page (max 100, default 50)',
    },
    search: {
      type: 'string',
      description: 'Search term to filter permissions by name or permission_id',
    },
    sort: {
      type: 'string',
      enum: [
        'name',
      ],
      default: 'name',
      description: 'Field to sort by',
    },
  },
};

const response = {
  200: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            permission_id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
          required: ['permission_id', 'name', 'description'],
          additionalProperties: false,
        },
      },
      pagination: {
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
      },
    },
    required: ['data', 'pagination'],
    additionalProperties: false,
    example: {
      data: [
        {
          permission_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
          name: 'INTERNAL_USERS_READ',
          description: 'Read users',
        },
        {
          permission_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          name: 'INTERNAL_USERS_WRITE',
          description: 'Create/update/delete users',
        },
      ],
      pagination: {
        page: 1,
        per_page: 50,
        pages: 1,
        count_page: 2,
        count_total: 2,
      },
    },
  },
};

export default routeSchema({
  route,
  querystring,
  response,
});
