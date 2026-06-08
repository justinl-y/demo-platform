import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IAuthGetUserByEmailParams, IAuthGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IAuthGetUserRefreshHashParams, IAuthGetUserRefreshHashResult } from './types/get-user-refresh-hash.typed.queries.ts';
import type { IAuthSetUserRefreshHashOnLoginParams, IAuthSetUserRefreshHashOnLoginResult } from './types/set-user-refresh-hash-on-login.typed.queries.ts';
import type { IAuthSetUserRefreshHashOnRefreshParams, IAuthSetUserRefreshHashOnRefreshResult } from './types/set-user-refresh-hash-on-refresh.typed.queries.ts';
import type { IAuthSetUserPasswordResetParams, IAuthSetUserPasswordResetResult } from './types/set-user-password-reset.typed.queries.ts';
import type { IAuthSetUserPasswordResetEmailSentParams, IAuthSetUserPasswordResetEmailSentResult } from './types/set-user-password-reset-email-sent.typed.queries.ts';
import type { IAuthSetUserRefreshHashNullParams, IAuthSetUserRefreshHashNullResult } from './types/set-user-refresh-hash-null.typed.queries.ts';

const relPath = import.meta.dirname;
const getUserQuery = cwd('get-user-by-email', relPath);
const getUserWithRefreshHashQuery = cwd('get-user-refresh-hash', relPath);
const setUserRefreshHashOnLoginQuery = cwd('set-user-refresh-hash-on-login', relPath);
const setUserRefreshHashOnRefreshQuery = cwd('set-user-refresh-hash-on-refresh', relPath);
const setUserPasswordReset = cwd('set-user-password-reset', relPath);
const setUserPasswordResetEmailSent = cwd('set-user-password-reset-email-sent', relPath);
const setUserRefreshHashNullQuery = cwd('set-user-refresh-hash-null', relPath);

function createAuthRepository(db: DatabaseDecorator) {
  return {
    getUserByEmail: ({
      email,
    }: IAuthGetUserByEmailParams) =>
      db.query<IAuthGetUserByEmailResult>(getUserQuery, { email }, 'one'),

    getUserWithRefreshToken: ({
      userId,
    }: IAuthGetUserRefreshHashParams) =>
      db.query<IAuthGetUserRefreshHashResult>(getUserWithRefreshHashQuery, { userId }, 'one'),

    setUserRefreshTokenOnLogin: async ({
      userId,
      hashedRefreshToken,
    }: IAuthSetUserRefreshHashOnLoginParams): Promise<void> => {
      await db.transaction()
        .add<IAuthSetUserRefreshHashOnLoginResult>({
          files: [setUserRefreshHashOnLoginQuery],
          params: {
            userId,
            hashedRefreshToken,
          },
        })
        .execute();
    },

    setUserTokenOnRefresh: async ({
      userId,
      newRefreshTokenHash,
    }: IAuthSetUserRefreshHashOnRefreshParams): Promise<void> => {
      await db.transaction()
        .add<IAuthSetUserRefreshHashOnRefreshResult>({
          files: [setUserRefreshHashOnRefreshQuery],
          params: {
            userId,
            newRefreshTokenHash,
          },
        })
        .execute();
    },

    setUserPasswordReset: async ({
      userId,
      passwordResetTokenHash,
      passwordResetTokenExpiryMinutes,
    }: IAuthSetUserPasswordResetParams): Promise<{ user: IAuthSetUserPasswordResetResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IAuthSetUserPasswordResetResult>({
          files: [setUserPasswordReset],
          params: {
            userId,
            passwordResetTokenHash,
            passwordResetTokenExpiryMinutes,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    setUserPasswordResetEmailSent: async ({
      userId,
      passwordResetTokenHash,
    }: IAuthSetUserPasswordResetEmailSentParams): Promise<{ user: IAuthSetUserPasswordResetEmailSentResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IAuthSetUserPasswordResetEmailSentResult>({
          files: [setUserPasswordResetEmailSent],
          params: {
            userId,
            passwordResetTokenHash,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    removeUserRefreshToken: async ({
      userId,
    }: IAuthSetUserRefreshHashNullParams): Promise<{ user: IAuthSetUserRefreshHashNullResult | undefined }> => {
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

export type { AuthRepository };
export { createAuthRepository };
