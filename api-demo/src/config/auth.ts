import { secretValues } from '#utils/secrets-manager';

function authConfig() {
  return {
    secret: secretValues.AUTH_SECRET,
    audience: secretValues.AUTH_AUDIENCE,
  };
}

export {
  authConfig,
};
