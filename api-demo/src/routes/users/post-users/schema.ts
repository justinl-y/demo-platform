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
      description: 'User\'s email address, must be unique',
    },
    full_name: {
      type: 'string',
      description: 'User\'s fullname',
    },
    known_as: {
      type: 'string',
      nullable: true,
      description: 'User\'s known by name or first name',
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
      status: {
        type: 'string',
        description: 'The active status of the user',
        example: 'DEACTIVATED',
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
