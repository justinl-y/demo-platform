import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['health'],
  summary: 'Database health check endpoint',
  description: 'Returns the current health status of the database server',
  security: [],
};

const response = {
  200: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['OK'],
        description: 'Health status indicator',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'ISO timestamp of the health check',
      },
    },
    required: ['status', 'timestamp'],
    additionalProperties: false,
  },
};

export default routeSchema({ route, response });
