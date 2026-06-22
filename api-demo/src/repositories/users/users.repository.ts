import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IUsersGetUsersParams, IUsersGetUsersResult } from './types/get-users.typed.queries.ts';
import type { IUsersGetUserByEmailParams, IUsersGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IUsersGetUserByStatusParams, IUsersGetUserByStatusResult } from './types/get-user-by-status.typed.queries.ts';
import type { IUsersGetNonDeactivatedUserByIdParams, IUsersGetNonDeactivatedUserByIdResult } from './types/get-non-deactivated-user-by-id.typed.queries.ts';
import type { IUsersAddUserParams, IUsersAddUserResult } from './types/add-user.typed.queries.ts';
import type { IUsersSetUserParams, IUsersSetUserResult } from './types/set-user.typed.queries.ts';
import type { IUsersSetUserEmailParams, IUsersSetUserEmailResult } from './types/set-user-email.typed.queries.ts';
import type { IUsersSetUserInviteEmailSentParams, IUsersSetUserInviteEmailSentResult } from './types/set-user-invite-email-sent.typed.queries.ts';
import type { IUsersRemoveUserParams, IUsersRemoveUserResult } from './types/remove-user.typed.queries.ts';
import type { IUsersSetUserInvitedParams, IUsersSetUserInvitedResult } from './types/set-user-invited.typed.queries.ts';
import type { IUsersGetPendingInvitationParams, IUsersGetPendingInvitationResult } from './types/get-pending-invitation.typed.queries.ts';
import type { IUsersCancelUserInviteParams, IUsersCancelUserInviteResult } from './types/cancel-user-invite.typed.queries.ts';
import type { IUsersSetUserActiveParams, IUsersSetUserActiveResult } from './types/set-user-active.typed.queries.ts';
import type { IUsersSetUserDeactivatedParams, IUsersSetUserDeactivatedResult } from './types/set-user-deactivated.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersQuery = cwd('get-users', relPath);
const getUserByEmailQuery = cwd('get-user-by-email', relPath);
const getUserByStatusQuery = cwd('get-user-by-status', relPath);
const getNonDeactivatedUserByIdQuery = cwd('get-non-deactivated-user-by-id', relPath);
const addUserQuery = cwd('add-user', relPath);
const updateUserQuery = cwd('set-user', relPath);
const updateUserEmailQuery = cwd('set-user-email', relPath);
const updateUserInviteEmailSent = cwd('set-user-invite-email-sent', relPath);
const removeUserQuery = cwd('remove-user', relPath);
const inviteUserQuery = cwd('set-user-invited', relPath);
const getPendingInvitationQuery = cwd('get-pending-invitation', relPath);
const cancelUserInviteQuery = cwd('cancel-user-invite', relPath);
const activateUserQuery = cwd('set-user-active', relPath);
const deactivateUserQuery = cwd('set-user-deactivated', relPath);

function createUsersRepository(db: DatabaseDecorator) {
  return {
    getUsers: ({
      userId,
      status,
      limit,
      offset,
    }: IUsersGetUsersParams) => {
      const queryParams = {
        userId,
        status,
        limit,
        offset,
      };

      return db.query<IUsersGetUsersResult>(getUsersQuery, queryParams, 'one');
    },

    getUserByEmail: ({
      email,
    }: IUsersGetUserByEmailParams) => {
      return db.query<IUsersGetUserByEmailResult>(getUserByEmailQuery, { email }, 'one');
    },

    getNonDeactivatedUserById: ({
      userId,
    }: IUsersGetNonDeactivatedUserByIdParams) => {
      return db.query<IUsersGetNonDeactivatedUserByIdResult>(getNonDeactivatedUserByIdQuery, { userId }, 'one');
    },

    getUserByStatus: ({
      userId,
      status,
    }: IUsersGetUserByStatusParams) => {
      const queryParams = {
        userId,
        status,
      };

      return db.query<IUsersGetUserByStatusResult>(getUserByStatusQuery, queryParams, 'one');
    },

    getPendingInvitation: ({
      inviteTokenHash,
    }: IUsersGetPendingInvitationParams) => {
      return db.query<IUsersGetPendingInvitationResult>(getPendingInvitationQuery, { inviteTokenHash }, 'one');
    },

    addUser: async ({
      email,
      fullName,
      knownAs,
    }: IUsersAddUserParams): Promise<{ user: IUsersAddUserResult }> => {
      const [userResult] = await db.transaction()
        .add<IUsersAddUserResult>({
          files: [addUserQuery],
          params: {
            email,
            fullName,
            knownAs,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    updateUser: async ({
      userId,
      fullName,
      knownAs,
    }: IUsersSetUserParams): Promise<{ user: IUsersSetUserResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersSetUserResult>({
          files: [updateUserQuery],
          params: {
            userId,
            fullName,
            knownAs,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    updateUserEmail: async ({
      userId,
      newEmail,
    }: IUsersSetUserEmailParams): Promise<{ user: IUsersSetUserEmailResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersSetUserEmailResult>({
          files: [updateUserEmailQuery],
          params: {
            userId,
            newEmail,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    updateUserInviteEmailSent: async ({
      userId,
      inviteTokenHash,
    }: IUsersSetUserInviteEmailSentParams): Promise<{ user: IUsersSetUserInviteEmailSentResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersSetUserInviteEmailSentResult>({
          files: [updateUserInviteEmailSent],
          params: {
            userId,
            inviteTokenHash,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    removeUser: async ({
      userId,
    }: IUsersRemoveUserParams): Promise<{ user: IUsersRemoveUserResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersRemoveUserResult>({
          files: [removeUserQuery],
          params: {
            userId,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    cancelUserInvite: async ({
      userId,
    }: IUsersCancelUserInviteParams): Promise<{ user: IUsersCancelUserInviteResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersCancelUserInviteResult>({
          files: [cancelUserInviteQuery],
          params: {
            userId,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    inviteUser: async ({
      userId,
      inviteTokenHash,
      inviteTokenExpiryDays,
    }: IUsersSetUserInvitedParams): Promise<{ user: IUsersSetUserInvitedResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersSetUserInvitedResult>({
          files: [inviteUserQuery],
          params: {
            userId,
            inviteTokenHash,
            inviteTokenExpiryDays,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    activateUser: async ({
      inviteTokenHash,
      passwordHash,
    }: IUsersSetUserActiveParams): Promise<{ user: IUsersSetUserActiveResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersSetUserActiveResult>({
          files: [activateUserQuery],
          params: {
            inviteTokenHash,
            passwordHash,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },

    deactivateUser: async ({
      userId,
      newPasswordHash,
    }: IUsersSetUserDeactivatedParams): Promise<{ user: IUsersSetUserDeactivatedResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IUsersSetUserDeactivatedResult>({
          files: [deactivateUserQuery],
          params: {
            userId,
            newPasswordHash,
          },
        })
        .execute();

      return {
        user: userResult[0],
      };
    },
  };
}

type UsersRepository = ReturnType<typeof createUsersRepository>;

export type { UsersRepository };
export { createUsersRepository };

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
