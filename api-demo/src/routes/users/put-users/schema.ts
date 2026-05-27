import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Update a user',
  description: 'Update a user',
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
    full_name: {
      type: 'string',
      minLength: 1,
      transform: ['trim'],
      description: 'User\'s full name',
    },
    known_as: {
      type: 'string',
      nullable: true,
      minLength: 1,
      transform: ['trim'],
      description: 'User\'s known by name',
    },
  },
  required: ['full_name'],
  additionalProperties: false,
};

const response = {
  200: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'User ID',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      full_name: {
        type: 'string',
        nullable: false,
        description: 'User full name',
        example: 'John Doe',
      },
      known_as: {
        type: 'string',
        nullable: true,
        description: 'User known as name (usually first name)',
        example: 'John',
      },
    },
    required: [
      'user_id',
      'full_name',
      'known_as',
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
