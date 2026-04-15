import { secretValues } from '#utils/secrets-manager';

const accessJwtExpirationMinutes = 60;
const accessCookieExpirationSeconds = accessJwtExpirationMinutes * 60;
const refreshJwtExpirationtDays = 7;
const refreshCookieExpirationSeconds = refreshJwtExpirationtDays * 24 * 60 * 60;

function authConfig() {
  return {
    audience: secretValues.AUTH_AUDIENCE,
    secret: secretValues.AUTH_SECRET,
    saltWorkFactor: 10,
    accessTokenJwt: 'access',
    accessTokenJwtExpiration: `${accessJwtExpirationMinutes}m`,
    accessTokenCookie: 'access_token',
    accessTokenCookieMaxAge: accessCookieExpirationSeconds,
    refreshTokenJwt: 'refresh',
    refreshTokenJwtExpiration: `${refreshJwtExpirationtDays}d`,
    refreshTokenCookie: 'refresh_token',
    refreshTokenCookieMaxAge: refreshCookieExpirationSeconds,
  } as const;
}

export {
  authConfig,
};
