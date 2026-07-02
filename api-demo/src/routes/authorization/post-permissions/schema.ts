import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Create a permission',
  description: 'Create a permission',
  security: [{ cookieAuth: [] }],
};

const body = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      transform: ['trim'],
      description: 'Permission name, must be unique',
    },
    description: {
      type: 'string',
      minLength: 1,
      transform: ['trim'],
      description: 'Human readable description of the permission',
    },
  },
  required: ['name', 'description'],
  additionalProperties: false,
};

const response = {
  201: {
    type: 'object',
    properties: {
      permission_id: {
        type: 'string',
        format: 'uuid',
        description: 'Permission ID',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      name: {
        type: 'string',
        description: 'Permission name',
        example: 'INTERNAL_USERS_READ',
      },
      description: {
        type: 'string',
        description: 'Human readable description of the permission',
        example: 'Read users',
      },
    },
    required: [
      'permission_id',
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
