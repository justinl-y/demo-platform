import {
  routeSchema,
} from '#utils/functions';
import { paginatedResponse, pageQuery, perPageQuery } from '#utils/schemas';

const route = {
  tags: ['Authorization'],
  summary: 'Get roles with their assigned permissions',
  description: 'Returns roles with their assigned permissions. Pass an optional "role_id" query parameter to return a single role.',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    role_id: {
      type: 'string',
      format: 'uuid',
      description: 'Optional role id to return a single role',
    },
    page: pageQuery,
    per_page: perPageQuery,
  },
};

const items = {
  type: 'object',
  properties: {
    role_id: {
      type: 'string',
      format: 'uuid',
    },
    role_name: {
      type: 'string',
    },
    permissions: {
      type: 'object',
      propertyNames: {
        type: 'string',
        format: 'uuid',
      },
      additionalProperties: {
        type: 'object',
        properties: {
          permission_id: {
            type: 'string',
            format: 'uuid',
          },
          permission_name: {
            type: 'string',
          },
        },
        required: ['permission_id', 'permission_name'],
        additionalProperties: false,
      },
    },
  },
  required: ['role_id', 'role_name', 'permissions'],
  additionalProperties: false,
};

const example = {
  data: [
    {
      role_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      role_name: 'ADMIN',
      permissions: {
        'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
          permission_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          permission_name: 'INTERNAL_USERS_READ',
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
