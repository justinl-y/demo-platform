import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['authorization'],
  summary: 'Delete a permission',
  description: 'Hard delete a permission',
  security: [{ cookieAuth: [] }],
};

const params = {
  type: 'object',
  properties: {
    permission_id: {
      type: 'string',
      format: 'uuid',
      description: 'Permission\'s id',
    },
  },
  required: ['permission_id'],
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
