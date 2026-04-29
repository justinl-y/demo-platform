import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Get single or group of users',
  description: 'Returns a single or group of active users',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      description: 'User id for fetch one',
    },
  },
};

const response = {
  200: {
    type: 'object',
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
