import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Replace a role\'s permissions',
  description: 'Replaces the role\'s entire permission set with the supplied permissions.',
  security: [{ cookieAuth: [] }],
};

const params = {
  type: 'object',
  properties: {
    role_id: {
      type: 'string',
      format: 'uuid',
      description: 'Role\'s id',
    },
  },
  required: ['role_id'],
  additionalProperties: false,
};

const body = {
  type: 'object',
  properties: {
    permissions: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
      minItems: 1,
      uniqueItems: true,
      description: 'The complete set of permission ids the role should have',
    },
  },
  required: ['permissions'],
  additionalProperties: false,
};

const response = {
  200: {
    type: 'object',
    description: 'The modified role-permission resource',
    properties: {
      role_id: {
        type: 'string',
        format: 'uuid',
        description: 'Role ID',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      permissions: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        description: 'Permission ids now assigned to the role',
        example: [
          'a3bb189e-8bf9-3888-9912-ace4e6543002',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        ],
      },
    },
    required: [
      'role_id',
      'permissions',
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
