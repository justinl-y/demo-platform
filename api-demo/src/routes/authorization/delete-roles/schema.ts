import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authorization'],
  summary: 'Delete a role',
  description: 'Hard delete a role',
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
