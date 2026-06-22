import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['authorization'],
  summary: 'Get one or more roles',
  description: 'Returns one or more roles',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
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
    role_id: {
      type: 'string',
      format: 'uuid',
      description: 'Optional role id to fetch a single role',
    },
  },
  required: ['page', 'per_page'],
};

const response = {
  200: {
    type: 'object',
    properties: {
      output: {
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
    required: ['output', 'count', 'pagination'],
    additionalProperties: false,
    example: {
      output: {
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
