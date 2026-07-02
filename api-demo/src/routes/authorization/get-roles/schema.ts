import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Get one or more roles',
  description: 'Returns one or more roles',
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
      description: 'Search term to filter roles by name or role_id',
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
        type: 'object',
        propertyNames: {
          type: 'string',
          format: 'uuid',
        },
        additionalProperties: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
          required: ['name', 'description'],
          additionalProperties: false,
        },
      },
      count: {
        type: 'integer',
      },
      pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
          },
          pages: {
            type: 'integer',
          },
        },
        required: ['page', 'pages'],
        additionalProperties: false,
      },
    },
    required: ['data', 'count', 'pagination'],
    additionalProperties: false,
    example: {
      data: {
        'a3bb189e-8bf9-3888-9912-ace4e6543002': {
          name: 'ADMIN',
          description: 'Full access to all resources',
        },
        'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
          name: 'INTERNAL_USER_READ',
          description: 'Read access to base resources',
        },
      },
      count: 2,
      pagination: {
        page: 1,
        pages: 1,
      },
    },
  },
};

export default routeSchema({
  route,
  querystring,
  response,
});
