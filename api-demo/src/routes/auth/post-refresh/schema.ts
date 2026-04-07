const route = {
  tags: ['auth'],
  summary: 'User refresh access token',
  description: 'Refreshes a user/s token with a valid refresh token',
};

const body = {
  type: 'object',
  required: ['token_refresh'],
  additionalProperties: false,
  properties: {
    token_refresh: {
      type: 'string',
      description: 'JWT bearer token for refreshing access token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature',
    },
  },
};

const response = {
  200: {
    type: 'object',
    required: [
      'token_access',
    ],
    additionalProperties: false,
    properties: {
      token_access: {
        type: 'string',
        description: 'JWT bearer token for authenticated requests',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature',
      },
    },
  },
};

export default {
  schema: {
    ...route,
    body,
    response,
  },
};
