import {
  routeSchema,
} from '#utils/functions';
import { paginatedResponse, pageQuery, perPageQuery } from '#utils/schemas';

const route = {
  tags: ['Internal Users'],
  summary: 'Get users with their assigned roles',
  description: 'Returns users with their assigned roles. Pass an optional "user_id" query parameter to return a single user.',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      format: 'uuid',
      description: 'Optional user id to return a single user',
    },
    page: pageQuery,
    per_page: perPageQuery,
  },
};

const items = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      format: 'uuid',
    },
    user_email: {
      type: 'string',
      format: 'email',
    },
    user_full_name: {
      type: 'string',
    },
    roles: {
      type: 'object',
      propertyNames: {
        type: 'string',
        format: 'uuid',
      },
      additionalProperties: {
        type: 'object',
        properties: {
          role_id: {
            type: 'string',
            format: 'uuid',
          },
          role_name: {
            type: 'string',
          },
        },
        required: ['role_id', 'role_name'],
        additionalProperties: false,
      },
    },
  },
  required: ['user_id', 'user_email', 'user_full_name', 'roles'],
  additionalProperties: false,
};

const example = {
  data: [
    {
      user_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      user_email: 'alice.smith@example.com',
      user_full_name: 'Alice Smith',
      roles: {
        'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
          role_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          role_name: 'ADMIN',
        },
      },
    },
  ],
  pagination: {
    page: 1,
    per_page: 50,
    pages: 1,
    count_page: 1,
    count_total: 1,
  },
};

const response = paginatedResponse(items, example);

export default routeSchema({
  route,
  querystring,
  response,
});
