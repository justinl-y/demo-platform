import { secretValues } from '#lib/secrets-manager';

const sentryConfig = {
  getDsn: () => secretValues.SENTRY_DSN,
  tracesSampleRate: {
    TEST: 0,
    LOCAL: 1,
    STAGE: 0.2,
    PROD: 0.1,
  },
  profilesSampleRate: {
    TEST: 0,
    LOCAL: 1,
    STAGE: 0.25,
    PROD: 0.2,
  },
};

export {
  sentryConfig,
};
