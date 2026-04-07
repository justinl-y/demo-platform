import { secretValues } from '#utils/secrets-manager';

function authConfig() {
  return {
    secret: secretValues.AUTH_SECRET,
    audience: secretValues.AUTH_AUDIENCE,
    accessTokenExpiration: '60m',
    refreshTokenExpiration: '7d',
  };
}

export {
  authConfig,
};
