import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IRolesPermissionsGetRolesPermissionsParams, IRolesPermissionsGetRolesPermissionsResult } from './types/get-roles-permissions.typed.queries.ts';
import type { IRolesPermissionsGetRolePermissionIdsParams, IRolesPermissionsGetRolePermissionIdsResult } from './types/get-role-permission-ids.typed.queries.ts';
import type { IRolesPermissionsGetPermissionRoleIdsParams, IRolesPermissionsGetPermissionRoleIdsResult } from './types/get-permission-role-ids.typed.queries.ts';
import type { IRolesPermissionsAddRolePermissionsParams, IRolesPermissionsAddRolePermissionsResult } from './types/add-role-permissions.typed.queries.ts';
import type { IRolesPermissionsRemoveRolePermissionsParams, IRolesPermissionsRemoveRolePermissionsResult } from './types/remove-role-permissions.typed.queries.ts';

const relPath = import.meta.dirname;
const getRolePermissionsQuery = cwd('get-roles-permissions', relPath);
const getRolePermissionIdsQuery = cwd('get-role-permission-ids', relPath);
const getPermissionRoleIdsQuery = cwd('get-permission-role-ids', relPath);
const addRolePermissionsQuery = cwd('add-role-permissions', relPath);
const removeRolePermissionsQuery = cwd('remove-role-permissions', relPath);

function createRolePermissionsRepository(db: DatabaseDecorator) {
  return {
    getRolePermissions: ({
      roleId,
      limit,
      offset,
    }: IRolesPermissionsGetRolesPermissionsParams) => {
      const queryParams = {
        roleId,
        limit,
        offset,
      };

      return db.query<IRolesPermissionsGetRolesPermissionsResult>(getRolePermissionsQuery, queryParams, 'one');
    },

    getRolePermissionIds: ({
      roleId,
    }: IRolesPermissionsGetRolePermissionIdsParams) => {
      return db.query<IRolesPermissionsGetRolePermissionIdsResult>(getRolePermissionIdsQuery, { roleId }, 'collection');
    },

    getPermissionRoleIds: ({
      permissionId,
    }: IRolesPermissionsGetPermissionRoleIdsParams) => {
      return db.query<IRolesPermissionsGetPermissionRoleIdsResult>(getPermissionRoleIdsQuery, { permissionId }, 'collection');
    },

    addRolePermissions: async ({
      roleId,
      permissionIds,
    }: IRolesPermissionsAddRolePermissionsParams): Promise<{ permissions: IRolesPermissionsAddRolePermissionsResult[] }> => {
      const [permissionRows] = await db.transaction()
        .add<IRolesPermissionsAddRolePermissionsResult>({
          files: [addRolePermissionsQuery],
          params: {
            roleId,
            permissionIds,
          },
        })
        .execute();

      return {
        permissions: permissionRows,
      };
    },

    // Replaces a role's permission set atomically: clear every existing assignment, then
    // insert the supplied set in a single transaction. Returns the newly assigned rows.
    replaceRolePermissions: async ({
      roleId,
      permissionIds,
    }: IRolesPermissionsAddRolePermissionsParams): Promise<{ permissions: IRolesPermissionsAddRolePermissionsResult[] }> => {
      const [, permissionRows] = await db.transaction()
        .add({
          files: [removeRolePermissionsQuery],
          params: {
            roleId,
          },
        })
        .add<IRolesPermissionsAddRolePermissionsResult>({
          files: [addRolePermissionsQuery],
          params: {
            roleId,
            permissionIds,
          },
        })
        .execute();

      return {
        permissions: permissionRows,
      };
    },

    // Removes every permission assigned to a role.
    removeRolePermissions: async ({
      roleId,
    }: IRolesPermissionsRemoveRolePermissionsParams): Promise<void> => {
      await db.transaction()
        .add<IRolesPermissionsRemoveRolePermissionsResult>({
          files: [removeRolePermissionsQuery],
          params: {
            roleId,
          },
        })
        .execute();
    },
  };
}

type RolePermissionsRepository = ReturnType<typeof createRolePermissionsRepository>;

export type { RolePermissionsRepository };
export { createRolePermissionsRepository };
