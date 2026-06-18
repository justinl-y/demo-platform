import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['authentication'],
  summary: 'User logout',
  description: 'Logs out user',
};

const response = {
  204: {
    type: 'null',
    description: 'User refresh token deleted from DB and both refresh and access cookies cleared',
    headers: {
      'set-cookie': {
        type: 'array',
        items: { type: 'string' },
        description: 'Clears access_token and refresh_token HttpOnly cookies',
      },
    },
  },
};

export default routeSchema({
  route,
  response,
});
