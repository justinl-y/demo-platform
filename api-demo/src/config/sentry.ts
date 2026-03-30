import { secretValues } from '../util/secrets-manager.ts';

const sentryConfig = {
  dsn: secretValues.SENTRY_DSN,
};

export {
  sentryConfig,
};
