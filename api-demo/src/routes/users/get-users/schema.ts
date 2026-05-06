import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Get one or more users',
  description: 'Returns one or more users',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    inactive: {
      type: 'string',
      enum: ['include', 'exclude', 'only'],
      default: 'include',
      description: 'Filter by active status',
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
    user_id: {
      type: 'string',
      format: 'uuid',
      description: 'Optional user id to fetch a single user',
    },
  },
};

const response = {
  200: {
    type: 'object',
    propertyNames: {
      type: 'string',
      format: 'uuid',
    },
    example: {
      'a3bb189e-8bf9-3888-9912-ace4e6543002': {
        email: 'user1@example.com',
        full_name: 'string',
        known_as: 'string',
        is_active: true,
      },
      'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
        email: 'user2@example.com',
        full_name: 'string',
        known_as: 'string',
        is_active: true,
      },
      'e7b2f4d1-9c3a-4f6e-b8d2-1a5e7c9f3b8d': {
        email: 'user3@example.com',
        full_name: 'string',
        known_as: 'string',
        is_active: false,
      },
    },
    additionalProperties: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
        full_name: {
          type: 'string',
        },
        known_as: {
          type: 'string',
          nullable: true,
        },
        is_active: {
          type: 'boolean',
        },
      },
      required: ['email', 'full_name', 'known_as', 'is_active'],
      additionalProperties: false,
    },
  },
};

export default routeSchema({
  route,
  querystring,
  response,
});
