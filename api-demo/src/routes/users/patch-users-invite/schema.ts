import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Invite a user',
  description: 'Invites a user; only with a status of CREATED, INVITED (for re-invite) or DEACTIVATED (for re-activation)',
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
        description: `User's changes status: 'INVITED'`,
        example: 'INVITED',
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
