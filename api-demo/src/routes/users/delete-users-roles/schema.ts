import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['users'],
  summary: 'Remove all of a user\'s roles',
  description: 'Removes every role assigned to the user.',
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
  204: {
    type: 'null',
  },
};

export default routeSchema({
  route,
  params,
  response,
});
