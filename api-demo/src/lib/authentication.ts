import bcrypt from 'bcryptjs';
import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  Config,
} from '#config/index';
import {
  SetWithSpan,
} from '#decorators/with-span';

import '@fastify/jwt';

import type {
  FastifyInstance,
} from 'fastify';

import type {
  JwtUser,
  TokenTypes,
} from '../types/jwt.ts';

const cookieOptions = {
  httpOnly: true,
  secure: Config.liveEnvironments.includes(Config.apiEnv),
  sameSite: 'lax' as const,
  path: '/',
};

class AuthUtils {
  @SetWithSpan()
  static async bcryptCompare(secret: string, secretHash: string): Promise<boolean> {
    return bcrypt.compare(secret, secretHash);
  }

  @SetWithSpan()
  static async bcryptHash(secret: string): Promise<string> {
    const { saltWorkFactor } = Config.authConfig();
    const salt = await bcrypt.genSalt(saltWorkFactor);
    return bcrypt.hash(secret, salt);
  }

  @SetWithSpan()
  static generateJwt(fastify: FastifyInstance, userId: string, userEmail: string, jwtType: TokenTypes): string {
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

    return fastify.jwt.sign(payload, options);
  }
}

const {
  bcryptCompare,
  bcryptHash,
  generateJwt,
} = AuthUtils;

export {
  bcryptCompare,
  bcryptHash,
  cookieOptions,
  generateJwt,
};
