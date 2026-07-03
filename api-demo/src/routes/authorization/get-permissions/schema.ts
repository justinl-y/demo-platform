import {
  routeSchema,
} from '#utils/functions';
import {
  paginatedResponse, pageQuery, perPageQuery, orderQuery, sortQuery, searchQuery,
} from '#utils/schemas';

const route = {
  tags: ['Authorization'],
  summary: 'Get one or more permissions',
  description: 'Returns one or more permissions',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    order: orderQuery,
    page: pageQuery,
    per_page: perPageQuery,
    search: searchQuery('Search term to filter permissions by name or permission_id'),
    sort: sortQuery(['name'], 'name'),
  },
};

const items = {
  type: 'object',
  properties: {
    permission_id: {
      type: 'string',
      format: 'uuid',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
  },
  required: ['permission_id', 'name', 'description'],
  additionalProperties: false,
};

const example = {
  data: [
    {
      permission_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      name: 'INTERNAL_USERS_READ',
      description: 'Read users',
    },
    {
      permission_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'INTERNAL_USERS_WRITE',
      description: 'Create/update/delete users',
    },
  ],
  pagination: {
    page: 1,
    per_page: 50,
    pages: 1,
    count_page: 2,
    count_total: 2,
  },
};

const response = paginatedResponse(items, example);

export default routeSchema({
  route,
  querystring,
  response,
});
