import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Assign roles to a user',
  description: 'Assigns one or more roles to a user, returning the created user-role resource',
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
      minItems: 1,
      uniqueItems: true,
      description: 'Role ids to assign to the user',
    },
  },
  required: ['roles'],
  additionalProperties: false,
};

const response = {
  201: {
    type: 'object',
    description: 'The created user-role resource',
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
        description: 'Role ids assigned to the user',
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
