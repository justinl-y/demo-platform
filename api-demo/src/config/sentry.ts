import { secretValues } from '#utils/secrets-manager';

const sentryConfig = {
  getDsn: () => secretValues.SENTRY_DSN,
  tracesSampleRate: {
    TEST: 0,
    PROD: 0.1,
    STAGE: 0.2,
  },
  profilesSampleRate: {
    TEST: 0,
    PROD: 0.2,
    STAGE: 0.25,
  },
};

export {
  sentryConfig,
};
