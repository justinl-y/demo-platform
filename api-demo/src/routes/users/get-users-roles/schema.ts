import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Get users with their assigned roles',
  description: 'Returns users with their assigned roles. Pass an optional "user_id" query parameter to return a single user.',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      format: 'uuid',
      description: 'Optional user id to return a single user',
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
  },
  required: ['page', 'per_page'],
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
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            user_email: {
              type: 'string',
              format: 'email',
            },
            user_full_name: {
              type: 'string',
            },
            roles: {
              type: 'object',
              propertyNames: {
                type: 'string',
                format: 'uuid',
              },
              additionalProperties: {
                type: 'object',
                properties: {
                  role_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  role_name: {
                    type: 'string',
                  },
                },
                required: ['role_id', 'role_name'],
                additionalProperties: false,
              },
            },
          },
          required: ['user_id', 'user_email', 'user_full_name', 'roles'],
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
          user_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
          user_email: 'alice.smith@example.com',
          user_full_name: 'Alice Smith',
          roles: {
            'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
              role_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
              role_name: 'ADMIN',
            },
          },
        },
      },
      count: 1,
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
