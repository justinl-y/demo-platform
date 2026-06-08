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
import type { SentEmailType } from '../../types/general.ts';

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

  const refreshToken = generateJwt(jwt, userId, email, refreshTokenJwt);

  const [accessToken, validPassword] = await Promise.all([
    generateJwt(jwt, userId, email, accessTokenJwt),
    bcryptCompare(password, passwordHash),
  ]);

  if (!validPassword) throw new UnauthorizedError('Authentication failed');

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

  const newAccessToken = generateJwt(jwt, userId, userEmail, accessTokenJwt);
  const newRefreshToken = generateJwt(jwt, userId, userEmail, refreshTokenJwt);

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

interface PasswordForgotResult {
  user_id: string;
  password_reset_email_sent: boolean;
}

async function passwordForgot(repository: AuthRepository, params: PasswordForgotParams): Promise<PasswordForgotResult | undefined> {
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
      randomBytesLength,
    },
  } = Config.authConfig();
  const {
    appBaseUrl,
  } = Config;

  // The raw token travels in the email link; only its hash is persisted.
  const passwordResetToken = randomAlphaNumeric(randomBytesLength);
  const passwordResetTokenHash = sha256Hex(passwordResetToken);

  // persist user reset token hash
  await repository.setUserPasswordReset({
    userId,
    passwordResetTokenHash,
    passwordResetTokenExpiryMinutes: passwordResetTokenExpirationMinutes,
  });

  const actionUrl = `${appBaseUrl}/password-reset?token=${passwordResetToken}`;

  let emailServiceSuccess: boolean = false;

  // send email via SES
  try {
    const sentPasswordResetEmailParams = {
      toEmail: email,
      actionUrl,
      emailType: 'PASSWORD_RESET' as SentEmailType,
    };

    await sendEmail(sentPasswordResetEmailParams);

    emailServiceSuccess = true;
  }
  catch (err) {
    // Logged to Sentry for investigation
    captureSentryException(err);

    console.error(err, `Password reset email send failed for ${email}`);
  }

  let userStamped;

  // set email sent status
  if (emailServiceSuccess) {
    ({
      user: userStamped,
    } = await repository.setUserPasswordResetEmailSent({
      userId,
      passwordResetTokenHash,
    }));
  }

  let emailSent: boolean = false;

  if (emailServiceSuccess && userStamped) emailSent = true;

  return {
    user_id: userId,
    password_reset_email_sent: emailSent,
  };
}

interface PasswordResetParams {
  passwordResetToken: string;
  newPassword: string;
}

interface PasswordResetResult {
  user_id: string;
}

async function passwordReset(repository: AuthRepository, params: PasswordResetParams): Promise<PasswordResetResult | null> {
  return null;
}

export {
  login,
  refresh,
  logout,
  passwordForgot,
  passwordReset,
};
