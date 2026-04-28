import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IAuthPostLoginGetUserResult } from './types/get-user.typed.queries.ts';
import type { IAuthPostRefreshGetUserWithRefreshTokenResult } from './types/get-user-with-refresh-token.typed.queries.ts';

const relPath = import.meta.dirname;
const getUserQuery = cwd('get-user', relPath);
const getUserWithRefreshTokenQuery = cwd('get-user-with-refresh-token', relPath);
const setUserTokenOnLoginQuery = cwd('set-user-token-on-login', relPath);
const setUserTokenOnRefreshQuery = cwd('set-user-token-on-refresh', relPath);

async function getUserByEmail(db: DatabaseDecorator, email: string) {
  return db.query<IAuthPostLoginGetUserResult>(getUserQuery, { email }, 'one');
}

async function getUserWithRefreshToken(db: DatabaseDecorator, userId: string) {
  return db.query<IAuthPostRefreshGetUserWithRefreshTokenResult>(getUserWithRefreshTokenQuery, { userId }, 'one');
}

async function setUserTokenOnLogin(db: DatabaseDecorator, userId: string, hashedTokenRefresh: string) {
  return db.transaction([{
    files: [setUserTokenOnLoginQuery],
    params: {
      hashedTokenRefresh,
      userId,
    },
  }]);
}

async function setUserTokenOnRefresh(db: DatabaseDecorator, userId: string, newTokenRefreshHash: string) {
  return db.transaction([{
    files: [setUserTokenOnRefreshQuery],
    params: {
      newTokenRefreshHash,
      userId,
    },
  }]);
}

export {
  getUserByEmail,
  getUserWithRefreshToken,
  setUserTokenOnLogin,
  setUserTokenOnRefresh,
};
