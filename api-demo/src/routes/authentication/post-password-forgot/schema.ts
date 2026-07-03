import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Authentication'],
  summary: 'User password forgot',
  description: 'Triggers a password reset flow',
};

const body = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      transform: ['trim', 'toLowerCase'],
      description: 'User email address',
    },
  },
  required: ['email'],
  additionalProperties: false,
};

const response = {
  204: {
    type: 'null',
  },
};

export default routeSchema({
  route,
  body,
  response,
});
