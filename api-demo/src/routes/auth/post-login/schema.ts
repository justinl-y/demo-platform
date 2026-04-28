import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['auth'],
  summary: 'User login',
  description: 'Authenticates a user with email and password',
};

const body = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address',
    },
    password: {
      type: 'string',
      description: 'User password',
    },
  },
};

const response = {
  200: {
    type: 'object',
    headers: {
      'set-cookie': {
        type: 'array',
        items: { type: 'string' },
        description: 'Sets access_token and refresh_token as HttpOnly cookies',
      },
    },
    required: [
      'id',
      'email',
      'full_name',
      'known_as',
    ],
    additionalProperties: false,
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
        description: 'User ID',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'user@example.com',
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
  },
};

export default routeSchema({
  route,
  body,
  response,
});
