import bcrypt from 'bcryptjs';

import {
  Config,
} from '#config/index';

import type {
  FastifyInstance,
} from 'fastify';
import type {
  JwtTokenType,
} from '../types/auth.ts';

async function bcryptCompare(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
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

  if (jwtType === 'access') {
    options.expiresIn = accessTokenExpiration;
  };

  if (jwtType === 'refresh') {
    options.expiresIn = refreshTokenExpiration;
  };

  return this.jwt.sign(payload, options);
};

export {
  bcryptCompare,
  generateJwt,
};
