const base = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'API Demo',
      description: 'API docs generated from Fastify route schemas',
      version: '1.0.0',
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Login, logout, token refresh and password reset',
      },
      {
        name: 'Authorization',
        description: 'Roles, permissions management and assignments',
      },
      {
        name: 'Internal Users',
        description: 'Internal user management',
      },
      {
        name: 'Health Check',
        description: 'Service and dependency health-check endpoints',
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey' as const,
          in: 'cookie' as const,
          name: 'access_token',
          description: 'JWT supplied as an HttpOnly cookie',
        },
      },
    },
  },
};

export { base };
