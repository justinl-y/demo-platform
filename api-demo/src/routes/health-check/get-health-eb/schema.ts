import {
  routeSchema,
} from '#utils/functions';

const route = {
  tags: ['health'],
  summary: 'Elastic Beanstalk health check endpoint',
  description: 'Returns the current health status of the API service for Elastic Beanstalk',
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
  },
};

export default routeSchema({
  route,
  response,
});
