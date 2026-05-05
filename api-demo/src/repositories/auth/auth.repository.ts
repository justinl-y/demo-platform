import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IAuthGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IAuthGetUserRefreshHashResult } from './types/get-user-refresh-hash.typed.queries.ts';
import type { IAuthSetUserRefreshHashNullResult } from './types/set-user-refresh-hash-null.typed.queries.ts';

const relPath = import.meta.dirname;
const getUserQuery = cwd('get-user-by-email', relPath);
const getUserWithRefreshTokenQuery = cwd('get-user-refresh-hash', relPath);
const setUserRefreshTokenOnLoginQuery = cwd('set-user-refresh-hash-on-login', relPath);
const setUserTokenOnRefreshQuery = cwd('set-user-refresh-hash-on-refresh', relPath);
const setUserTokenNullQuery = cwd('set-user-refresh-hash-null', relPath);

function createAuthRepository(db: DatabaseDecorator) {
  return {
    getUserByEmail: (email: string) =>
      db.query<IAuthGetUserByEmailResult>(getUserQuery, { email }, 'one'),

    getUserWithRefreshToken: (userId: string) =>
      db.query<IAuthGetUserRefreshHashResult>(getUserWithRefreshTokenQuery, { userId }, 'one'),

    setUserRefreshTokenOnLogin: (userId: string, hashedTokenRefresh: string) =>
      db.transaction()
        .add({
          files: [setUserRefreshTokenOnLoginQuery],
          params: {
            hashedTokenRefresh,
            userId,
          },
        })
        .execute(),

    setUserTokenOnRefresh: (userId: string, newTokenRefreshHash: string) =>
      db.transaction()
        .add({
          files: [setUserTokenOnRefreshQuery],
          params: {
            newTokenRefreshHash,
            userId,
          },
        })
        .execute(),

    removeUserRefreshToken: async (userId: string): Promise<{ user: IAuthSetUserRefreshHashNullResult | null }> => {
      const [userRow] = await db.transaction()
        .add<IAuthSetUserRefreshHashNullResult>({
          files: [setUserTokenNullQuery],
          params: { userId },
        })
        .execute();

      return {
        user: userRow?.[0] ?? null,
      };
    },
  };
}

type AuthRepository = ReturnType<typeof createAuthRepository>;

// need this for later
/* async function removeUserRefreshToken(
  db: DatabaseDecorator,
  userId: string,
): Promise<{
  token: IAuthSetUserRefreshHashNullResult | null;
  session: IAuthInvalidateSessionResult | null;
  log: IAuthAuditLogResult | null;
}> {
  const [tokenRows, sessionRows, logRows] = await buildTransaction(db)
    .add<IAuthSetUserRefreshHashNullResult>({
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

export type { AuthRepository };
export { createAuthRepository };
