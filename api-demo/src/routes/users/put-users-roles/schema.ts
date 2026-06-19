import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Replace a user\'s roles',
  description: 'Replaces the user\'s entire role set with the supplied roles. An empty array clears all of the user\'s roles.',
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

const body = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
      uniqueItems: true,
      description: 'The complete set of role ids the user should have. Pass an empty array to remove all roles.',
    },
  },
  required: ['roles'],
  additionalProperties: false,
};

const response = {
  200: {
    type: 'object',
    description: 'The modified user-role resource',
    properties: {
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'User ID',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      roles: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        description: 'Role ids now assigned to the user',
        example: [
          'a3bb189e-8bf9-3888-9912-ace4e6543002',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        ],
      },
    },
    required: [
      'user_id',
      'roles',
    ],
    additionalProperties: false,
  },
};

export default routeSchema({
  route,
  params,
  body,
  response,
});
