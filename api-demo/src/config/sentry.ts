import { secretValues } from '#utils/secrets-manager';

const sentryConfig = {
  dsn: secretValues.SENTRY_DSN,
};

export {
  sentryConfig,
};
