import {
  routeSchema,
} from '#utils/functions';
import {
  paginatedResponse, pageQuery, perPageQuery, orderQuery, sortQuery, searchQuery,
} from '#utils/schemas';

const route = {
  tags: ['Internal Users'],
  summary: 'Get one or more users',
  description: 'Returns one or more users',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    order: orderQuery,
    page: pageQuery,
    per_page: perPageQuery,
    status: {
      anyOf: [
        {
          type: 'string',
          enum: ['CREATED', 'INVITED', 'ACTIVE', 'DEACTIVATED'],
        },
        {
          type: 'array',
          items: {
            type: 'string',
            enum: ['CREATED', 'INVITED', 'ACTIVE', 'DEACTIVATED'],
          },
          uniqueItems: true,
        },
      ],
      description: 'Filter by status',
    },
    search: searchQuery('Search term to filter users by name (any part of full name), email or user_id'),
    sort: sortQuery(['name', 'email', 'created_at'], 'created_at'),
  },
};

const items = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      format: 'uuid',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    full_name: {
      type: 'string',
    },
    known_as: {
      type: 'string',
      nullable: true,
    },
    status: {
      type: 'string',
    },
  },
  required: ['user_id', 'email', 'full_name', 'known_as', 'status'],
  additionalProperties: false,
};

const example = {
  data: [
    {
      user_id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      email: 'user1@example.com',
      full_name: 'string',
      known_as: 'string',
      status: 'ACTIVE',
    },
    {
      user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'user2@example.com',
      full_name: 'string',
      known_as: 'string',
      status: 'ACTIVE',
    },
    {
      user_id: 'e7b2f4d1-9c3a-4f6e-b8d2-1a5e7c9f3b8d',
      email: 'user3@example.com',
      full_name: 'string',
      known_as: 'string',
      status: 'DEACTIVATED',
    },
  ],
  pagination: {
    page: 1,
    per_page: 50,
    pages: 1,
    count_page: 3,
    count_total: 3,
  },
};

const response = paginatedResponse(items, example);

export default routeSchema({
  route,
  querystring,
  response,
});
