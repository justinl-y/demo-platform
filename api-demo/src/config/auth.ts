import { apiEnv, liveEnvironments } from '#config/api';
import { secretValues } from '#lib/api-secrets';

const accessJwtExpirationMinutes = liveEnvironments.includes(apiEnv) ? 5 : 60;
const accessCookieExpirationSeconds = accessJwtExpirationMinutes * 60;
const refreshJwtExpirationDays = 7;
const refreshCookieExpirationSeconds = refreshJwtExpirationDays * 24 * 60 * 60;

let _cache: ReturnType<typeof buildAuthConfig> | undefined;

function buildAuthConfig() {
  return {
    invitationTokenExpirationDays: 7,
    passwordResetTokenExpirationMinutes: 30,
    encryptSaltWorkFactor: 10,
    password: {
      expirationDays: 7,
      passwordLengthMin: 10,
      passwordLengthMax: 40,
      // Minimum zxcvbn guessability score (0–4) required once the composition rules pass.
      // 3 = "safely strong"; rejects rule-satisfying-but-guessable passwords like "Password1!".
      passwordMinScore: 3,
      tokenLength: 30,
    },
    audience: secretValues.AUTH_AUDIENCE,
    secret: secretValues.AUTH_SECRET,
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
