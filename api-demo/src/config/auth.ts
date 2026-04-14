import { secretValues } from '#utils/secrets-manager';

const expirationMinutes = 60 * 60;
const expirationDays = 7 * 24 * 60 * 60;

function authConfig() {
  return {
    audience: secretValues.AUTH_AUDIENCE,
    secret: secretValues.AUTH_SECRET,
    saltWorkFactor: 10,
    accessTokenJwt: 'access',
    accessTokenJwtExpiration: `${expirationMinutes}m`,
    accessTokenCookie: 'access_token',
    accessTokenCookieMaxAge: expirationMinutes,
    refreshTokenJwt: 'refresh',
    refreshTokenJwtExpiration: `${expirationDays}d`,
    refreshTokenCookie: 'refresh_token',
    refreshTokenCookieMaxAge: expirationDays,
  } as const;
}

export {
  authConfig,
};
