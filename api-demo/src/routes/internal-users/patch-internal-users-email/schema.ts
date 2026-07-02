import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Internal Users'],
  summary: 'Change a user\'s email',
  description: 'Change a user\'s email',
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
    new_email: {
      type: 'string',
      format: 'email',
      transform: ['trim', 'toLowerCase'],
      description: 'New user\'s email address, must be unique',
    },
  },
  required: ['new_email'],
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
      email: {
        type: 'string',
        format: 'email',
        description: 'User new email',
        example: 'john.doe@email.com',
      },
    },
    required: [
      'user_id',
      'email',
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
