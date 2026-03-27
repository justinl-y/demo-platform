import { secretValues } from '../util/secrets-manager.ts';

const sentry = {
  dsn: secretValues.SENTRY_DSN,
};

export {
  sentry,
};
