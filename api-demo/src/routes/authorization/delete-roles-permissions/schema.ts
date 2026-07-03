import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Remove all of a role\'s permissions',
  description: 'Removes every permission assigned to the role.',
  security: [{ cookieAuth: [] }],
};

const params = {
  type: 'object',
  properties: {
    role_id: {
      type: 'string',
      format: 'uuid',
      description: 'Role\'s id',
    },
  },
  required: ['role_id'],
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
