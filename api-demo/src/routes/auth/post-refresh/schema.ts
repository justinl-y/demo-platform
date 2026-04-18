import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['auth'],
  summary: 'User refresh access token',
  description: 'Refreshes the access token cookie using the refresh token cookie',
};

const response = {
  204: {
    type: 'null',
    description: 'Access token cookie refreshed',
    headers: {
      'set-cookie': {
        type: 'string',
        description: 'Sets access_token as an HttpOnly cookie',
      },
    },
  },
};

export default routeSchema({ route, response });
