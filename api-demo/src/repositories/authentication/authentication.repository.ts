import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IAuthenticationGetUserByEmailParams, IAuthenticationGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IAuthenticationGetUserByPasswordResetTokenParams, IAuthenticationGetUserByPasswordResetTokenResult } from './types/get-user-by-password-reset-token.typed.queries.ts';
import type { IAuthenticationGetUserRefreshHashParams, IAuthenticationGetUserRefreshHashResult } from './types/get-user-refresh-hash.typed.queries.ts';
import type { IAuthenticationGetUserPermissionsParams, IAuthenticationGetUserPermissionsResult } from './types/get-user-permissions.typed.queries.ts';
import type { IAuthenticationSetUserRefreshHashOnLoginParams, IAuthenticationSetUserRefreshHashOnLoginResult } from './types/set-user-refresh-hash-on-login.typed.queries.ts';
import type { IAuthenticationSetUserRefreshHashOnRefreshParams, IAuthenticationSetUserRefreshHashOnRefreshResult } from './types/set-user-refresh-hash-on-refresh.typed.queries.ts';
import type { IAuthenticationSetUserPasswordResetParams, IAuthenticationSetUserPasswordResetResult } from './types/set-user-password-reset.typed.queries.ts';
import type { IAuthenticationSetUserPasswordResetEmailSentParams, IAuthenticationSetUserPasswordResetEmailSentResult } from './types/set-user-password-reset-email-sent.typed.queries.ts';
import type { IAuthenticationSetUserResetPasswordParams, IAuthenticationSetUserResetPasswordResult } from './types/set-user-reset-password.typed.queries.ts';
import type { IAuthenticationSetUserRefreshHashNullParams, IAuthenticationSetUserRefreshHashNullResult } from './types/set-user-refresh-hash-null.typed.queries.ts';

const relPath = import.meta.dirname;
const getUserByEmailQuery = cwd('get-user-by-email', relPath);
const getUserByPasswordResetTokenQuery = cwd('get-user-by-password-reset-token', relPath);
const getUserWithRefreshHashQuery = cwd('get-user-refresh-hash', relPath);
const getUserPermissionsQuery = cwd('get-user-permissions', relPath);
const setUserRefreshHashOnLoginQuery = cwd('set-user-refresh-hash-on-login', relPath);
const setUserRefreshHashOnRefreshQuery = cwd('set-user-refresh-hash-on-refresh', relPath);
const setUserPasswordReset = cwd('set-user-password-reset', relPath);
const setUserPasswordResetEmailSent = cwd('set-user-password-reset-email-sent', relPath);
const setUserResetPassword = cwd('set-user-reset-password', relPath);
const setUserRefreshHashNullQuery = cwd('set-user-refresh-hash-null', relPath);

function createAuthenticationRepository(db: DatabaseDecorator) {
  return {
    getUserByEmail: ({
      email,
    }: IAuthenticationGetUserByEmailParams) =>
      db.query<IAuthenticationGetUserByEmailResult>(getUserByEmailQuery, { email }, 'one'),

    getUserByPasswordResetToken: ({
      passwordResetTokenHash,
    }: IAuthenticationGetUserByPasswordResetTokenParams) =>
      db.query<IAuthenticationGetUserByPasswordResetTokenResult>(getUserByPasswordResetTokenQuery, { passwordResetTokenHash }, 'one'),

    getUserWithRefreshToken: ({
      userId,
    }: IAuthenticationGetUserRefreshHashParams) =>
      db.query<IAuthenticationGetUserRefreshHashResult>(getUserWithRefreshHashQuery, { userId }, 'one'),

    getUserPermissions: ({
      userId,
    }: IAuthenticationGetUserPermissionsParams) =>
      db.query<IAuthenticationGetUserPermissionsResult>(getUserPermissionsQuery, { userId }, 'one'),

    setUserRefreshTokenOnLogin: async ({
      userId,
      hashedRefreshToken,
    }: IAuthenticationSetUserRefreshHashOnLoginParams): Promise<void> => {
      await db.transaction()
        .add<IAuthenticationSetUserRefreshHashOnLoginResult>({
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
    }: IAuthenticationSetUserRefreshHashOnRefreshParams): Promise<void> => {
      await db.transaction()
        .add<IAuthenticationSetUserRefreshHashOnRefreshResult>({
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
    }: IAuthenticationSetUserPasswordResetParams): Promise<{ user: IAuthenticationSetUserPasswordResetResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IAuthenticationSetUserPasswordResetResult>({
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
    }: IAuthenticationSetUserPasswordResetEmailSentParams): Promise<{ user: IAuthenticationSetUserPasswordResetEmailSentResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IAuthenticationSetUserPasswordResetEmailSentResult>({
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

    setUserResetPassword: async ({
      passwordResetTokenHash,
      hashedNewPassword,
    }: IAuthenticationSetUserResetPasswordParams): Promise<{ user: IAuthenticationSetUserResetPasswordResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IAuthenticationSetUserResetPasswordResult>({
          files: [setUserResetPassword],
          params: {
            passwordResetTokenHash,
            hashedNewPassword,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    removeUserRefreshToken: async ({
      userId,
    }: IAuthenticationSetUserRefreshHashNullParams): Promise<{ user: IAuthenticationSetUserRefreshHashNullResult | undefined }> => {
      const [userRow] = await db.transaction()
        .add<IAuthenticationSetUserRefreshHashNullResult>({
          files: [setUserRefreshHashNullQuery],
          params: { userId },
        })
        .execute();

      return {
        user: userRow?.[0] ?? undefined,
      };
    },
  };
}

type AuthenticationRepository = ReturnType<typeof createAuthenticationRepository>;

export type { AuthenticationRepository };
export { createAuthenticationRepository };
