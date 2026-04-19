import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['auth'],
  summary: 'User refresh tokens',
  description: 'Refreshes the access token and refresh tokens and issues new cookies using the existing refresh token cookie',
};

const response = {
  204: {
    type: 'null',
    description: 'Access token cookie refreshed',
    headers: {
      'set-cookie': {
        type: 'array',
        items: { type: 'string' },
        description: 'Sets new access_token and refresh_tokens as HttpOnly cookies',
      },
    },
  },
};

export default routeSchema({ route, response });
