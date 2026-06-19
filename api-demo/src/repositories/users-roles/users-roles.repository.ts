import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IUsersRolesGetUsersRolesParams, IUsersRolesGetUsersRolesResult } from './types/get-users-roles.typed.queries.ts';
import type { IUsersRolesGetUserRoleIdsParams, IUsersRolesGetUserRoleIdsResult } from './types/get-user-role-ids.typed.queries.ts';
import type { IUsersRolesAddUserRolesParams, IUsersRolesAddUserRolesResult } from './types/add-user-roles.typed.queries.ts';
import type { IUsersRolesRemoveUserRolesParams, IUsersRolesRemoveUserRolesResult } from './types/remove-user-roles.typed.queries.ts';

const relPath = import.meta.dirname;
const getUsersRolesQuery = cwd('get-users-roles', relPath);
const getUserRoleIdsQuery = cwd('get-user-role-ids', relPath);
const addUserRolesQuery = cwd('add-user-roles', relPath);
const removeUserRolesQuery = cwd('remove-user-roles', relPath);

function createUsersRolesRepository(db: DatabaseDecorator) {
  return {
    getUsersRoles: ({
      userId,
      limit,
      offset,
    }: IUsersRolesGetUsersRolesParams) => {
      const queryParams = {
        userId,
        limit,
        offset,
      };

      return db.query<IUsersRolesGetUsersRolesResult>(getUsersRolesQuery, queryParams, 'one');
    },

    getUserRoleIds: ({
      userId,
    }: IUsersRolesGetUserRoleIdsParams) => {
      return db.query<IUsersRolesGetUserRoleIdsResult>(getUserRoleIdsQuery, { userId }, 'collection');
    },

    addUserRoles: async ({
      userId,
      roleIds,
    }: IUsersRolesAddUserRolesParams): Promise<{ roles: IUsersRolesAddUserRolesResult[] }> => {
      const [roleRows] = await db.transaction()
        .add<IUsersRolesAddUserRolesResult>({
          files: [addUserRolesQuery],
          params: {
            userId,
            roleIds,
          },
        })
        .execute();

      return {
        roles: roleRows,
      };
    },

    // Replaces a user's role set atomically: clear every existing assignment, then insert the
    // supplied set in a single transaction. An empty roleIds set clears the user's roles.
    replaceUserRoles: async ({
      userId,
      roleIds,
    }: IUsersRolesAddUserRolesParams): Promise<{ roles: IUsersRolesAddUserRolesResult[] }> => {
      const [, roleRows] = await db.transaction()
        .add({
          files: [removeUserRolesQuery],
          params: {
            userId,
          },
        })
        .add<IUsersRolesAddUserRolesResult>({
          files: [addUserRolesQuery],
          params: {
            userId,
            roleIds,
          },
        })
        .execute();

      return {
        roles: roleRows,
      };
    },

    // Removes every role assigned to a user.
    removeUserRoles: async ({
      userId,
    }: IUsersRolesRemoveUserRolesParams): Promise<void> => {
      await db.transaction()
        .add<IUsersRolesRemoveUserRolesResult>({
          files: [removeUserRolesQuery],
          params: {
            userId,
          },
        })
        .execute();
    },
  };
}

type UsersRolesRepository = ReturnType<typeof createUsersRolesRepository>;

export type { UsersRolesRepository };
export { createUsersRolesRepository };
