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
    id: userId, full_name: fullName, known_as: knownAs, password_hash: passwordHash,
  } = user;

  if (!passwordHash) throw new UnauthorizedError('Authentication failed');

  const refreshToken = generateJwt(jwt, userId, email, refreshTokenJwt);

  const [accessToken, validPassword] = await Promise.all([
    generateJwt(jwt, userId, email, accessTokenJwt),
    bcryptCompare(password, passwordHash),
  ]);

  if (!validPassword) throw new UnauthorizedError('Authentication failed');

  const hashedTokenRefresh = await bcryptHash(refreshToken);

  const setUserRefreshTokenOnLoginParams = {
    userId,
    hashedTokenRefresh,
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

  const validRefreshToken = await bcryptCompare(tokenRefresh, user.token_refresh_hash);
  if (!validRefreshToken) throw new UnauthorizedError('Authentication failed');

  const newAccessToken = generateJwt(jwt, userId, userEmail, accessTokenJwt);
  const newRefreshToken = generateJwt(jwt, userId, userEmail, refreshTokenJwt);

  const newTokenRefreshHash = await bcryptHash(newRefreshToken);

  const setUserTokenOnRefreshParams = {
    userId,
    newTokenRefreshHash,
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
  const validRefreshToken = await bcryptCompare(tokenRefresh, user.token_refresh_hash);
  if (!validRefreshToken) return nullReturnedUserId;

  // delete refresh token
  const {
    user: removedUser,
  } = await repository.removeUserRefreshToken({ userId });

  return {
    returnedUserId: removedUser?.id ?? null,
  };
}

export {
  login,
  refresh,
  logout,
};
