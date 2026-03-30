const swaggerConfig = {
  routePrefix: '/api-docs' as const,
  staticCSP: true,
  transformSpecificationClone: true,
  uiConfig: {
    docExpansion: 'list' as const,
    deepLinking: false,
  },
};

export {
  swaggerConfig,
};
