import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Deactivate a user',
  description: 'Deactivates a user; only with a status of ACTIVE',
  security: [{ cookieAuth: [] }],
};

const params = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      format: 'uuid',
      description: 'User\'s id',
    },
  },
  required: ['user_id'],
  additionalProperties: false,
};

const response = {
  200: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'User\'s id',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      status: {
        type: 'string',
        description: `User's changed status: 'DEACTIVATED'`,
        example: 'DEACTIVATED',
      },
    },
    required: [
      'user_id',
      'status',
    ],
    additionalProperties: false,
  },
};

export default routeSchema({
  route,
  params,
  response,
});
