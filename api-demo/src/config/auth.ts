import { secretValues } from '#utils/secrets-manager';

const accessJwtExpirationMinutes = 60;
const accessCookieExpirationSeconds = accessJwtExpirationMinutes * 60;
const refreshJwtExpirationDays = 7;
const refreshCookieExpirationSeconds = refreshJwtExpirationDays * 24 * 60 * 60;

let _cache: ReturnType<typeof buildAuthConfig> | undefined;

function buildAuthConfig() {
  return {
    audience: secretValues.AUTH_AUDIENCE,
    secret: secretValues.AUTH_SECRET,
    saltWorkFactor: 10,
    accessTokenJwt: 'access',
    accessTokenJwtExpiration: `${accessJwtExpirationMinutes}m`,
    accessTokenCookie: 'access_token',
    accessTokenCookieMaxAge: accessCookieExpirationSeconds,
    refreshTokenJwt: 'refresh',
    refreshTokenJwtExpiration: `${refreshJwtExpirationDays}d`,
    refreshTokenCookie: 'refresh_token',
    refreshTokenCookieMaxAge: refreshCookieExpirationSeconds,
  } as const;
}

function authConfig() {
  return (_cache ??= buildAuthConfig());
}

export {
  authConfig,
};
