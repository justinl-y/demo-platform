import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Internal Users'],
  summary: 'Cancel a user invitation',
  description: 'Cancels a pending invitation; only with a status of INVITED. Reverts the user to CREATED and clears the invitation token, expiry and email-sent stamp.',
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

const response = {
  200: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        format: 'uuid',
        description: 'User\'s id',
        example: '7acd58cc-4ae5-4046-9037-383a057e4970',
      },
      status: {
        type: 'string',
        description: `User's changed status: 'CREATED'`,
        example: 'CREATED',
      },
    },
    required: [
      'user_id',
      'status',
    ],
    additionalProperties: false,
  },
};

export default routeSchema({
  route,
  params,
  response,
});
