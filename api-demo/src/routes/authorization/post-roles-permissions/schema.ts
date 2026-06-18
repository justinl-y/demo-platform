import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['authorization'],
  summary: 'Assign permissions to a role',
  description: 'Assigns one or more permissions to a role, returning the created role-permission resource',
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
      description: 'Permission ids to assign to the role',
    },
  },
  required: ['permissions'],
  additionalProperties: false,
};

const response = {
  201: {
    type: 'object',
    description: 'The created role-permission resource',
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
        description: 'Permission ids assigned to the role',
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
