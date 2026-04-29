import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['auth'],
  summary: 'Logout user',
  description: 'Logs out user by deletion of access token',
};

const params = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: {
      type: 'string',
      format: 'uuid',
    },
  },
};

const response = {
  204: {
    type: 'null',
    description: 'Access token deleted',
  },
};

export default routeSchema({
  route,
  params,
  response,
});
