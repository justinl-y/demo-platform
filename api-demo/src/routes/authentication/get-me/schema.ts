import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authentication'],
  summary: 'Current user',
  description: 'Returns the currently authenticated user, identified by the access_token cookie',
  security: [{ cookieAuth: [] }],
};

const response = {
  200: {
    type: 'object',
    properties: {
      user_id: {
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
      permissions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Permission keys granted to the user (from the access token claim)',
        example: ['INTERNAL_USERS_READ', 'INTERNAL_USERS_WRITE'],
      },
    },
    required: [
      'user_id',
      'email',
      'full_name',
      'known_as',
      'permissions',
    ],
    additionalProperties: false,
  },
};

export default routeSchema({
  route,
  response,
});
