import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Internal Users'],
  summary: 'Delete a user',
  description: 'Hard delete a user; only with a status of CREATED',
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
