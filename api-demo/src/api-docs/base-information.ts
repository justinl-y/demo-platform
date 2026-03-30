const baseInformation = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'API Demo',
      description: 'API docs generated from Fastify route schemas',
      version: '1.0.0',
    },
    tags: [
      {
        name: 'health',
        description: 'Service and dependency health-check endpoints',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT bearer token supplied in the Authorization header',
        },
      },
    },
  },
};

export { baseInformation };
