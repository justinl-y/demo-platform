import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Get one or more users',
  description: 'Returns one or more active users',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
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
      },
      'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
        email: 'user2@example.com',
        full_name: 'string',
        known_as: 'string',
      },
      'e7b2f4d1-9c3a-4f6e-b8d2-1a5e7c9f3b8d': {
        email: 'user3@example.com',
        full_name: 'string',
        known_as: 'string',
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
      },
      required: ['email', 'full_name', 'known_as'],
      additionalProperties: false,
    },
  },
};

export default routeSchema({
  route,
  querystring,
  response,
});
