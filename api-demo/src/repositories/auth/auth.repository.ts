import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IAuthGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IAuthGetUserRefreshHashResult } from './types/get-user-refresh-hash.typed.queries.ts';
import type { IAuthSetUserRefreshHashNullResult } from './types/set-user-refresh-hash-null.typed.queries.ts';

const relPath = import.meta.dirname;
const getUserQuery = cwd('get-user-by-email', relPath);
const getUserWithRefreshHashQuery = cwd('get-user-refresh-hash', relPath);
const setUserRefreshHashOnLoginQuery = cwd('set-user-refresh-hash-on-login', relPath);
const setUserRefreshHashOnRefreshQuery = cwd('set-user-refresh-hash-on-refresh', relPath);
const setUserRefreshHashNullQuery = cwd('set-user-refresh-hash-null', relPath);

interface GetUserByEmail {
  email: string;
}

interface GetUserWithRefreshToken {
  userId: string;
}

interface SetUserRefreshTokenOnLogin {
  userId: string;
  hashedTokenRefresh: string;
}

interface SetUserTokenOnRefresh {
  userId: string;
  newTokenRefreshHash: string;
}

interface RemoveUserRefreshToken {
  userId: string;
}

function createAuthRepository(db: DatabaseDecorator) {
  return {
    getUserByEmail: ({
      email,
    }: GetUserByEmail) =>
      db.query<IAuthGetUserByEmailResult>(getUserQuery, { email }, 'one'),

    getUserWithRefreshToken: ({
      userId,
    }: GetUserWithRefreshToken) =>
      db.query<IAuthGetUserRefreshHashResult>(getUserWithRefreshHashQuery, { userId }, 'one'),

    setUserRefreshTokenOnLogin: async ({
      userId,
      hashedTokenRefresh,
    }: SetUserRefreshTokenOnLogin): Promise<void> => {
      await db.transaction()
        .add({
          files: [setUserRefreshHashOnLoginQuery],
          params: {
            userId,
            hashedTokenRefresh,
          },
        })
        .execute();
    },

    setUserTokenOnRefresh: async ({
      userId,
      newTokenRefreshHash,
    }: SetUserTokenOnRefresh): Promise<void> => {
      await db.transaction()
        .add({
          files: [setUserRefreshHashOnRefreshQuery],
          params: {
            userId,
            newTokenRefreshHash,
          },
        })
        .execute();
    },

    removeUserRefreshToken: async ({
      userId,
    }: RemoveUserRefreshToken): Promise<{ user: IAuthSetUserRefreshHashNullResult | null }> => {
      const [userRow] = await db.transaction()
        .add<IAuthSetUserRefreshHashNullResult>({
          files: [setUserRefreshHashNullQuery],
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
