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
  JwtTokenType,
} from '../types/auth.ts';

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

function generateJwt(this: FastifyInstance, userId: string, userEmail: string, jwtType: JwtTokenType) {
  const payload = {
    id: userId,
    email: userEmail,
    type: jwtType,
  };

  const options = {
    expiresIn: '0m',
  };

  const {
    accessTokenExpiration,
    refreshTokenExpiration,
  } = Config.authConfig();

  if (jwtType === 'access') options.expiresIn = accessTokenExpiration;
  else if (jwtType === 'refresh') options.expiresIn = refreshTokenExpiration;
  else throw new UnauthorizedError('Invalid token type');

  return this.jwt.sign(payload, options);
};

export {
  bcryptCompare,
  bcryptHash,
  generateJwt,
};
