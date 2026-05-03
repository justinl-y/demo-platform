import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IAuthGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IAuthGetUserWithRefreshTokenResult } from './types/get-user-with-refresh-token.typed.queries.ts';
import type { IAuthSetUserRefreshTokenNullResult } from './types/set-user-refresh-token-null.typed.queries.ts';

const relPath = import.meta.dirname;
const getUserQuery = cwd('get-user-by-email', relPath);
const getUserWithRefreshTokenQuery = cwd('get-user-with-refresh-token', relPath);
const setUserRefreshTokenOnLoginQuery = cwd('set-user-refresh-token-on-login', relPath);
const setUserTokenOnRefreshQuery = cwd('set-user-token-on-refresh', relPath);
const setUserTokenNullQuery = cwd('set-user-refresh-token-null', relPath);

async function getUserByEmail(db: DatabaseDecorator, email: string) {
  return db.query<IAuthGetUserByEmailResult>(getUserQuery, { email }, 'one');
}

async function getUserWithRefreshToken(db: DatabaseDecorator, userId: string) {
  return db.query<IAuthGetUserWithRefreshTokenResult>(getUserWithRefreshTokenQuery, { userId }, 'one');
}

async function setUserRefreshTokenOnLogin(db: DatabaseDecorator, userId: string, hashedTokenRefresh: string) {
  return db.transaction()
    .add({
      files: [setUserRefreshTokenOnLoginQuery],
      params: {
        hashedTokenRefresh,
        userId,
      },
    })
    .execute();
}

async function setUserTokenOnRefresh(db: DatabaseDecorator, userId: string, newTokenRefreshHash: string) {
  return db.transaction()
    .add({
      files: [setUserTokenOnRefreshQuery],
      params: {
        newTokenRefreshHash,
        userId,
      },
    })
    .execute();
}

async function removeUserRefreshToken(db: DatabaseDecorator, userId: string): Promise<{ user: IAuthSetUserRefreshTokenNullResult | null }> {
  const [userRow] = await db.transaction()
    .add<IAuthSetUserRefreshTokenNullResult>({
      files: [setUserTokenNullQuery],
      params: { userId },
    })
    .execute();

  return {
    user: userRow?.[0] ?? null,
  };
}

// need this for later
/* async function removeUserRefreshToken(
  db: DatabaseDecorator,
  userId: string,
): Promise<{
  token: IAuthSetUserRefreshTokenNullResult | null;
  session: IAuthInvalidateSessionResult | null;
  log: IAuthAuditLogResult | null;
}> {
  const [tokenRows, sessionRows, logRows] = await buildTransaction(db)
    .add<IAuthSetUserRefreshTokenNullResult>({
      files: [setUserTokenNullQuery],
      params: { userId },
    })
    .add<IAuthInvalidateSessionResult>({
      files: [invalidateSessionQuery],
      params: { userId },
    })
    .add<IAuthAuditLogResult>({
      files: [insertAuditLogQuery],
      params: { userId, action: 'logout' },
    })
    .execute();

  return {
    token: tokenRows?.[0] ?? null,
    session: sessionRows?.[0] ?? null,
    log: logRows?.[0] ?? null,
  };
} */

export {
  getUserByEmail,
  getUserWithRefreshToken,
  setUserRefreshTokenOnLogin,
  setUserTokenOnRefresh,
  removeUserRefreshToken,
};
