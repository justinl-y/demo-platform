import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Get roles with their assigned permissions',
  description: 'Returns roles with their assigned permissions. Pass an optional "role_id" query parameter to return a single role.',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    role_id: {
      type: 'string',
      format: 'uuid',
      description: 'Optional role id to return a single role',
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
            role_id: {
              type: 'string',
              format: 'uuid',
            },
            role_name: {
              type: 'string',
            },
            permissions: {
              type: 'object',
              propertyNames: {
                type: 'string',
                format: 'uuid',
              },
              additionalProperties: {
                type: 'object',
                properties: {
                  permission_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  permission_name: {
                    type: 'string',
                  },
                },
                required: ['permission_id', 'permission_name'],
                additionalProperties: false,
              },
            },
          },
          required: ['role_id', 'role_name', 'permissions'],
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
          role_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
          role_name: 'ADMIN',
          permissions: {
            'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
              permission_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
              permission_name: 'INTERNAL_USERS_READ',
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
