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
