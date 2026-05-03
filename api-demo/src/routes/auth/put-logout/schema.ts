import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['auth'],
  summary: 'Logout user',
  description: 'Logs out user by deletion of access token',
};

const response = {
  204: {
    type: 'null',
    description: 'User access token deleted',
  },
};

export default routeSchema({
  route,
  response,
});
