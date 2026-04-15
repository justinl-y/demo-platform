import bcrypt from 'bcryptjs';
import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  Config,
} from '#config/index';

import type {
  FastifyInstance,
} from 'fastify';

import type {
  JwtUser,
  TokenTypes,
} from '../types/jwt.ts';

const cookieOptions = {
  httpOnly: true,
  secure: (Config.liveEnvironments as string[]).includes(Config.apiEnv),
  sameSite: 'strict' as const,
  path: '/',
};

async function bcryptCompare(secret: string, secretHash: string) {
  return bcrypt.compare(secret, secretHash);
};

async function bcryptHash(secret: string) {
  const {
    saltWorkFactor,
  } = Config.authConfig();

  const salt = await bcrypt.genSalt(saltWorkFactor);
  const hash = await bcrypt.hash(secret, salt);

  return hash;
};

function generateJwt(this: FastifyInstance, userId: string, userEmail: string, jwtType: TokenTypes) {
  const payload = {
    id: userId,
    email: userEmail,
    type: jwtType,
  } as JwtUser;

  const options = {
    expiresIn: '0m',
  };

  const {
    accessTokenJwt,
    accessTokenJwtExpiration,
    refreshTokenJwt,
    refreshTokenJwtExpiration,
  } = Config.authConfig();

  if (jwtType === accessTokenJwt) options.expiresIn = accessTokenJwtExpiration;
  else if (jwtType === refreshTokenJwt) options.expiresIn = refreshTokenJwtExpiration;
  else throw new UnauthorizedError('Invalid token type');

  return this.jwt.sign(payload, options);
};

export {
  bcryptCompare,
  bcryptHash,
  cookieOptions,
  generateJwt,
};
