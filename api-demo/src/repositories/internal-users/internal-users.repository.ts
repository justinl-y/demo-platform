import { cwd, likeContains } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IInternalUsersGetUsersParams, IInternalUsersGetUsersResult } from './types/get-users.typed.queries.ts';
import type { IInternalUsersGetUserByEmailParams, IInternalUsersGetUserByEmailResult } from './types/get-user-by-email.typed.queries.ts';
import type { IInternalUsersGetUserByStatusParams, IInternalUsersGetUserByStatusResult } from './types/get-user-by-status.typed.queries.ts';
import type { IInternalUsersGetNonDeactivatedUserByIdParams, IInternalUsersGetNonDeactivatedUserByIdResult } from './types/get-non-deactivated-user-by-id.typed.queries.ts';
import type { IInternalUsersAddUserParams, IInternalUsersAddUserResult } from './types/add-user.typed.queries.ts';
import type { IInternalUsersSetUserParams, IInternalUsersSetUserResult } from './types/set-user.typed.queries.ts';
import type { IInternalUsersSetUserEmailParams, IInternalUsersSetUserEmailResult } from './types/set-user-email.typed.queries.ts';
import type { IInternalUsersSetUserInviteEmailSentParams, IInternalUsersSetUserInviteEmailSentResult } from './types/set-user-invite-email-sent.typed.queries.ts';
import type { IInternalUsersRemoveUserParams, IInternalUsersRemoveUserResult } from './types/remove-user.typed.queries.ts';
import type { IInternalUsersSetUserInvitedParams, IInternalUsersSetUserInvitedResult } from './types/set-user-invited.typed.queries.ts';
import type { IInternalUsersGetPendingInvitationParams, IInternalUsersGetPendingInvitationResult } from './types/get-pending-invitation.typed.queries.ts';
import type { IInternalUsersCancelUserInviteParams, IInternalUsersCancelUserInviteResult } from './types/cancel-user-invite.typed.queries.ts';
import type { IInternalUsersSetUserActiveParams, IInternalUsersSetUserActiveResult } from './types/set-user-active.typed.queries.ts';
import type { IInternalUsersSetUserDeactivatedParams, IInternalUsersSetUserDeactivatedResult } from './types/set-user-deactivated.typed.queries.ts';

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

function createInternalUsersRepository(db: DatabaseDecorator) {
  return {
    getUsers: ({
      search,
      status,
      sort,
      order,
      limit,
      offset,
    }: IInternalUsersGetUsersParams) => {
      const queryParams = {
        search: likeContains(search ?? null),
        status,
        sort,
        order,
        limit,
        offset,
      };

      return db.query<IInternalUsersGetUsersResult>(getUsersQuery, queryParams, 'one');
    },

    getUserByEmail: ({
      email,
    }: IInternalUsersGetUserByEmailParams) => {
      return db.query<IInternalUsersGetUserByEmailResult>(getUserByEmailQuery, { email }, 'one');
    },

    getNonDeactivatedUserById: ({
      userId,
    }: IInternalUsersGetNonDeactivatedUserByIdParams) => {
      return db.query<IInternalUsersGetNonDeactivatedUserByIdResult>(getNonDeactivatedUserByIdQuery, { userId }, 'one');
    },

    getUserByStatus: ({
      userId,
      status,
    }: IInternalUsersGetUserByStatusParams) => {
      const queryParams = {
        userId,
        status,
      };

      return db.query<IInternalUsersGetUserByStatusResult>(getUserByStatusQuery, queryParams, 'one');
    },

    getPendingInvitation: ({
      inviteTokenHash,
    }: IInternalUsersGetPendingInvitationParams) => {
      return db.query<IInternalUsersGetPendingInvitationResult>(getPendingInvitationQuery, { inviteTokenHash }, 'one');
    },

    addUser: async ({
      email,
      fullName,
      knownAs,
    }: IInternalUsersAddUserParams): Promise<{ user: IInternalUsersAddUserResult }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersAddUserResult>({
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
    }: IInternalUsersSetUserParams): Promise<{ user: IInternalUsersSetUserResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersSetUserResult>({
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
    }: IInternalUsersSetUserEmailParams): Promise<{ user: IInternalUsersSetUserEmailResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersSetUserEmailResult>({
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
    }: IInternalUsersSetUserInviteEmailSentParams): Promise<{ user: IInternalUsersSetUserInviteEmailSentResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersSetUserInviteEmailSentResult>({
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
    }: IInternalUsersRemoveUserParams): Promise<{ user: IInternalUsersRemoveUserResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersRemoveUserResult>({
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
    }: IInternalUsersCancelUserInviteParams): Promise<{ user: IInternalUsersCancelUserInviteResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersCancelUserInviteResult>({
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
    }: IInternalUsersSetUserInvitedParams): Promise<{ user: IInternalUsersSetUserInvitedResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersSetUserInvitedResult>({
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
    }: IInternalUsersSetUserActiveParams): Promise<{ user: IInternalUsersSetUserActiveResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersSetUserActiveResult>({
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
    }: IInternalUsersSetUserDeactivatedParams): Promise<{ user: IInternalUsersSetUserDeactivatedResult | undefined }> => {
      const [userResult] = await db.transaction()
        .add<IInternalUsersSetUserDeactivatedResult>({
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

type InternalUsersRepository = ReturnType<typeof createInternalUsersRepository>;

export type { InternalUsersRepository };
export { createInternalUsersRepository };

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
