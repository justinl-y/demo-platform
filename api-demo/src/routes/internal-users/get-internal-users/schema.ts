import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['Internal Users'],
  summary: 'Get one or more users',
  description: 'Returns one or more users',
  security: [{ cookieAuth: [] }],
};

const querystring = {
  type: 'object',
  properties: {
    order: {
      type: 'string',
      enum: [
        'ASC',
        'DESC',
      ],
      default: 'ASC',
      description: 'Sort order',
    },
    page: {
      type: 'string',
      format: 'integer',
      pattern: '^[1-9][0-9]*$',
      default: '1',
      description: 'Page number (default 1)',
    },
    per_page: {
      type: 'string',
      format: 'integer',
      pattern: '^([1-9][0-9]?|100)$',
      default: '50',
      description: 'Number of items per page (max 100, default 50)',
    },
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
    search: {
      type: 'string',
      description: 'Search term to filter users by name (any part of full name), email or user_id',
    },
    sort: {
      type: 'string',
      enum: [
        'name',
        'email',
        'created_at',
      ],
      default: 'created_at',
      description: 'Field to sort by',
    },
  },
};

const response = {
  200: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        propertyNames: {
          type: 'string',
          format: 'uuid',
        },
        additionalProperties: {
          type: 'object',
          properties: {
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
          required: ['email', 'full_name', 'known_as', 'status'],
          additionalProperties: false,
        },
      },
      count: {
        type: 'integer',
      },
      pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
          },
          pages: {
            type: 'integer',
          },
        },
        required: ['page', 'pages'],
        additionalProperties: false,
      },
    },
    required: ['data', 'count', 'pagination'],
    additionalProperties: false,
    example: {
      data: {
        'a3bb189e-8bf9-3888-9912-ace4e6543002': {
          email: 'user1@example.com',
          full_name: 'string',
          known_as: 'string',
          status: 'ACTIVE',
        },
        'f47ac10b-58cc-4372-a567-0e02b2c3d479': {
          email: 'user2@example.com',
          full_name: 'string',
          known_as: 'string',
          status: 'ACTIVE',
        },
        'e7b2f4d1-9c3a-4f6e-b8d2-1a5e7c9f3b8d': {
          email: 'user3@example.com',
          full_name: 'string',
          known_as: 'string',
          status: 'DEACTIVATED',
        },
      },
      count: 3,
      pagination: {
        page: 1,
        pages: 1,
      },
    },
  },
};

export default routeSchema({
  route,
  querystring,
  response,
});
