import * as apiConfig from './api.ts';
import * as authConfig from './auth.ts';
import * as awsConfig from './aws.ts';
import * as fastifyConfig from './fastify.ts';
import * as postgresConfig from './postgres.ts';
import * as responseValidationConfig from './reply-validation.ts';
import * as sentryConfig from './sentry.ts';
import * as swaggerConfig from './swagger.ts';

const Config = {
  ...apiConfig,
  ...authConfig,
  ...awsConfig,
  ...fastifyConfig,
  ...postgresConfig,
  ...responseValidationConfig,
  ...sentryConfig,
  ...swaggerConfig,
};

export {
  Config,
};
