import {
  BadRequestError,
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  bcryptCompare,
  bcryptHash,
  generateJwt,
} from '#lib/authentication';
import { Config } from '#config/index';
import {
  getUserByEmail,
  getUserWithRefreshToken,
  setUserRefreshTokenOnLogin,
  setUserTokenOnRefresh,
  removeUserRefreshToken,
} from '#repositories/auth/auth.repository';

import type { JWT } from '@fastify/jwt';
import type { DatabaseDecorator } from '../../types/database.ts';
import type { JwtUser } from '../../types/jwt.ts';

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

async function login(db: DatabaseDecorator, jwt: JWT, email: string, password: string): Promise<LoginResult> {
  const {
    accessTokenJwt,
    refreshTokenJwt,
  } = Config.authConfig();

  const user = await getUserByEmail(db, email);
  if (!user) throw new UnauthorizedError('Authentication failed');

  const {
    id: userId, full_name: fullName, known_as: knownAs, password_hash: passwordHash,
  } = user;

  const refreshToken = generateJwt(jwt, userId, email, refreshTokenJwt);

  const [accessToken, validPassword] = await Promise.all([
    generateJwt(jwt, userId, email, accessTokenJwt),
    bcryptCompare(password, passwordHash),
  ]);

  if (!validPassword) throw new UnauthorizedError('Authentication failed');

  const hashedTokenRefresh = await bcryptHash(refreshToken);

  await setUserRefreshTokenOnLogin(db, userId, hashedTokenRefresh);

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

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

async function refresh(db: DatabaseDecorator, jwt: JWT, tokenRefresh: string): Promise<RefreshResult> {
  const {
    accessTokenJwt,
    refreshTokenJwt,
  } = Config.authConfig();

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

  const user = await getUserWithRefreshToken(db, userId);
  if (!user) throw new UnauthorizedError('Authentication failed');

  const validRefreshToken = await bcryptCompare(tokenRefresh, user.token_refresh_hash);
  if (!validRefreshToken) throw new UnauthorizedError('Authentication failed');

  const newAccessToken = generateJwt(jwt, userId, userEmail, accessTokenJwt);
  const newRefreshToken = generateJwt(jwt, userId, userEmail, refreshTokenJwt);

  const newTokenRefreshHash = await bcryptHash(newRefreshToken);

  await setUserTokenOnRefresh(db, userId, newTokenRefreshHash);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

interface LogoutResult {
  returnedUserId: string | null;
}

async function logout(db: DatabaseDecorator, jwt: JWT, tokenRefresh: string): Promise<LogoutResult> {
  const {
    refreshTokenJwt,
  } = Config.authConfig();

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

  const user = await getUserWithRefreshToken(db, userId);
  if (!user) return nullReturnedUserId;

  // check for matching persisted token to prevent potential DoS with expired token
  const validRefreshToken = await bcryptCompare(tokenRefresh, user.token_refresh_hash);
  if (!validRefreshToken) return nullReturnedUserId;

  // delete refresh token
  const {
    user: removedUser,
  } = await removeUserRefreshToken(db, userId);

  return {
    returnedUserId: removedUser?.id ?? null,
  };
}

export {
  login,
  refresh,
  logout,
};
