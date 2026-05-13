import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Create a user',
  description: 'Create a user',
  security: [{ cookieAuth: [] }],
};

const body = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      transform: ['trim', 'toLowerCase'],
      description: 'User\'s email address, must be unique',
    },
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
  required: ['email', 'full_name'],
  additionalProperties: false,
};

const response = {
  201: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'User ID',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'john.doe@example.com',
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
      status: {
        type: 'string',
        description: 'The status of the user, this will be CREATED for new users',
        example: 'CREATED',
      },
    },
    required: [
      'id',
      'email',
      'full_name',
      'known_as',
      'status',
    ],
    additionalProperties: false,
  },
};

export default routeSchema({
  route,
  body,
  response,
});
