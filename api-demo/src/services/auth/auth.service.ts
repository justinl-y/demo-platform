import {
  BadRequestError,
  UnauthorizedError,
} from 'http-errors-enhanced';
import {
  bcryptCompare,
  bcryptHash,
  generateJwt,
} from '#lib/authentication';
import { sendEmail } from '#lib/mailer';
import { captureSentryException } from '#lib/sentry-instrument';
import {
  randomAlphaNumeric,
  sha256Hex,
} from '#utils/functions';
import { Config } from '#config/index';

import type { JWT } from '@fastify/jwt';
import type { AuthRepository } from '#repositories/auth/auth.repository';
import type { JwtUser } from '../../types/jwt.ts';

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    known_as: string | null;
  };
}
async function login(repository: AuthRepository, jwt: JWT, params: LoginParams): Promise<LoginResult> {
  const {
    accessTokenJwt,
    refreshTokenJwt,
  } = Config.authConfig();

  const {
    email,
    password,
  } = params;

  const user = await repository.getUserByEmail({ email });
  if (!user) throw new UnauthorizedError('Authentication failed');

  const {
    user_id: userId, full_name: fullName, known_as: knownAs, password_hash: passwordHash,
  } = user;
  if (!passwordHash) throw new UnauthorizedError('Authentication failed');

  const validPassword = await bcryptCompare(password, passwordHash);
  if (!validPassword) throw new UnauthorizedError('Authentication failed');

  const permissions = user.permissions ?? [];
  const accessToken = generateJwt(jwt, userId, email, accessTokenJwt, permissions);

  const refreshToken = generateJwt(jwt, userId, email, refreshTokenJwt);
  const hashedRefreshToken = await bcryptHash(refreshToken);

  const setUserRefreshTokenOnLoginParams = {
    userId,
    hashedRefreshToken,
  };

  await repository.setUserRefreshTokenOnLogin(setUserRefreshTokenOnLoginParams);

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      email,
      full_name: fullName,
      known_as: knownAs,
    },
  };
}

interface RefreshParams {
  tokenRefresh: string;
}

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

async function refresh(repository: AuthRepository, jwt: JWT, params: RefreshParams): Promise<RefreshResult> {
  const {
    accessTokenJwt,
    refreshTokenJwt,
  } = Config.authConfig();

  const {
    tokenRefresh,
  } = params;

  let decodedToken: JwtUser;

  try {
    decodedToken = jwt.verify(tokenRefresh);
  }
  catch {
    throw new UnauthorizedError('Authentication failed');
  }

  const {
    id: userId, email: userEmail, type: tokenType,
  } = decodedToken;

  if (tokenType !== refreshTokenJwt) throw new UnauthorizedError('Incorrect authorization token type');

  const user = await repository.getUserWithRefreshToken({ userId });
  if (!user) throw new UnauthorizedError('Authentication failed');

  const validRefreshToken = await bcryptCompare(tokenRefresh, user.refresh_token_hash);
  if (!validRefreshToken) throw new UnauthorizedError('Authentication failed');

  const newRefreshToken = generateJwt(jwt, userId, userEmail, refreshTokenJwt);

  const userPermissions = await repository.getUserPermissions({ userId });
  const permissions = userPermissions?.permissions ?? [];
  const newAccessToken = generateJwt(jwt, userId, userEmail, accessTokenJwt, permissions);
  const newRefreshTokenHash = await bcryptHash(newRefreshToken);

  const setUserTokenOnRefreshParams = {
    userId,
    newRefreshTokenHash,
  };

  await repository.setUserTokenOnRefresh(setUserTokenOnRefreshParams);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

interface LogoutParams {
  tokenRefresh: string;
}

interface LogoutResult {
  returnedUserId: string | null;
}

async function logout(repository: AuthRepository, jwt: JWT, params: LogoutParams): Promise<LogoutResult> {
  const {
    refreshTokenJwt,
  } = Config.authConfig();

  const {
    tokenRefresh,
  } = params;

  let decodedToken: JwtUser;

  try {
    decodedToken = jwt.verify(tokenRefresh);
  }
  catch {
    throw new BadRequestError('Invalid token');
  }

  const {
    id: userId, type: tokenType,
  } = decodedToken;

  if (tokenType !== refreshTokenJwt) throw new BadRequestError('Incorrect authorization token type');

  const nullReturnedUserId = {
    returnedUserId: null,
  };

  const user = await repository.getUserWithRefreshToken({ userId });
  if (!user) return nullReturnedUserId;

  // ensure the presented refresh token matches the persisted hash before clearing it (potential DoS)
  const validRefreshToken = await bcryptCompare(tokenRefresh, user.refresh_token_hash);
  if (!validRefreshToken) return nullReturnedUserId;

  // delete refresh token
  const {
    user: removedUser,
  } = await repository.removeUserRefreshToken({ userId });

  return {
    returnedUserId: removedUser?.id ?? null,
  };
}

interface PasswordForgotParams {
  email: string;
}

interface SendPasswordResetEmailParams {
  email: string;
  actionUrl: string;
  userId: string;
  passwordResetTokenHash: string;
}

// Sends the reset email and stamps the email-sent timestamp on success. Intended
// to run off the request path (callers do not await it), so it never throws —
// failures are captured for Sentry and logged instead.
async function sendPasswordResetEmail(repository: AuthRepository, params: SendPasswordResetEmailParams): Promise<void> {
  const {
    email,
    actionUrl,
    userId,
    passwordResetTokenHash,
  } = params;

  try {
    await sendEmail({
      toEmail: email,
      actionUrl,
      emailType: 'PASSWORD_RESET',
    });

    await repository.setUserPasswordResetEmailSent({
      userId,
      passwordResetTokenHash,
    });
  }
  catch (err) {
    captureSentryException(err);

    console.error(err, `Password reset email send failed for ${email}`);
  }
}

async function passwordForgot(repository: AuthRepository, params: PasswordForgotParams): Promise<void> {
  const {
    email,
  } = params;

  const validUserParams = {
    email,
  };

  const validUser = await repository.getUserByEmail(validUserParams);
  if (!validUser) return;

  const {
    user_id: userId,
  } = validUser;

  const {
    passwordResetTokenExpirationMinutes,
    password: {
      tokenLength,
    },
  } = Config.authConfig();
  const {
    appBaseUrl,
  } = Config;

  // The raw token travels in the email link; only its hash is persisted.
  const passwordResetToken = randomAlphaNumeric(tokenLength);
  const passwordResetTokenHash = sha256Hex(passwordResetToken);

  // persist user reset token hash
  await repository.setUserPasswordReset({
    userId,
    passwordResetTokenHash,
    passwordResetTokenExpiryMinutes: passwordResetTokenExpirationMinutes,
  });

  const actionUrl = `${appBaseUrl}/password-reset?token=${passwordResetToken}`;

  // Deliver off the request path — deliberately not awaited — so the slow SES call
  // does not sit on the response, which is the dominant timing-based enumeration
  // signal. A small residual delta remains (the known-account path does an extra
  // SELECT + UPDATE that the unknown path skips); equalizing that would require a
  // single email-keyed UPDATE or a queue. The send and email-sent stamp run in the
  // background.
  void sendPasswordResetEmail(repository, {
    email,
    actionUrl,
    userId,
    passwordResetTokenHash,
  });
}

interface PasswordResetParams {
  passwordResetToken: string;
  newPassword: string;
}

async function passwordReset(repository: AuthRepository, params: PasswordResetParams): Promise<void> {
  const {
    passwordResetToken,
    newPassword,
  } = params;

  // The raw token is compared by hash; only the hash is ever persisted.
  const passwordResetTokenHash = sha256Hex(passwordResetToken);

  // Validate the token cheaply (indexed lookup) before the expensive password
  // hash, so an invalid token is rejected without burning a bcrypt round.
  const existingUser = await repository.getUserByPasswordResetToken({ passwordResetTokenHash });
  if (!existingUser) throw new BadRequestError('Invalid or expired password reset token');

  const hashedNewPassword = await bcryptHash(newPassword);

  // Consume the token atomically: the UPDATE re-checks the token (active user,
  // unexpired) so it stays single-use even under concurrent requests, clears the
  // token, and nulls the refresh token to invalidate existing sessions. A null
  // result means the token was consumed between the lookup and here.
  const {
    user,
  } = await repository.setUserResetPassword({
    passwordResetTokenHash,
    hashedNewPassword,
  });

  if (!user) throw new BadRequestError('Invalid or expired password reset token');
}

export {
  login,
  refresh,
  logout,
  passwordForgot,
  passwordReset,
};
