import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Create a role',
  description: 'Create a role',
  security: [{ cookieAuth: [] }],
};

const body = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      transform: ['trim'],
      description: 'Role name, must be unique',
    },
    description: {
      type: 'string',
      minLength: 1,
      transform: ['trim'],
      description: 'Human readable description of the role',
    },
  },
  required: ['name', 'description'],
  additionalProperties: false,
};

const response = {
  201: {
    type: 'object',
    properties: {
      role_id: {
        type: 'string',
        format: 'uuid',
        description: 'Role ID',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      name: {
        type: 'string',
        description: 'Role name',
        example: 'ADMIN',
      },
      description: {
        type: 'string',
        description: 'Human readable description of the role',
        example: 'Full access to all resources',
      },
    },
    required: [
      'role_id',
      'name',
      'description',
    ],
    additionalProperties: false,
  },
};

export default routeSchema({
  route,
  body,
  response,
});
