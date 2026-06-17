import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IPermissionsGetPermissionsParams, IPermissionsGetPermissionsResult } from './types/get-permissions.typed.queries.ts';
import type { IPermissionsGetPermissionByNameParams, IPermissionsGetPermissionByNameResult } from './types/get-permission-by-name.typed.queries.ts';
import type { IPermissionsAddPermissionParams, IPermissionsAddPermissionResult } from './types/add-permission.typed.queries.ts';
import type { IPermissionsSetPermissionParams, IPermissionsSetPermissionResult } from './types/set-permission.typed.queries.ts';
import type { IPermissionsRemovePermissionParams, IPermissionsRemovePermissionResult } from './types/remove-permission.typed.queries.ts';

const relPath = import.meta.dirname;
const getPermissionsQuery = cwd('get-permissions', relPath);
const getPermissionByNameQuery = cwd('get-permission-by-name', relPath);
const addPermissionQuery = cwd('add-permission', relPath);
const updatePermissionQuery = cwd('set-permission', relPath);
const removePermissionQuery = cwd('remove-permission', relPath);

function createPermissionsRepository(db: DatabaseDecorator) {
  return {
    getPermissions: ({
      permissionId,
      limit,
      offset,
    }: IPermissionsGetPermissionsParams) => {
      const queryParams = {
        permissionId,
        limit,
        offset,
      };

      return db.query<IPermissionsGetPermissionsResult>(getPermissionsQuery, queryParams, 'one');
    },

    getPermissionByName: ({
      name,
    }: IPermissionsGetPermissionByNameParams) => {
      return db.query<IPermissionsGetPermissionByNameResult>(getPermissionByNameQuery, { name }, 'one');
    },

    addPermission: async ({
      name,
      description,
    }: IPermissionsAddPermissionParams): Promise<{ permission: IPermissionsAddPermissionResult }> => {
      const [permissionResult] = await db.transaction()
        .add<IPermissionsAddPermissionResult>({
          files: [addPermissionQuery],
          params: {
            name,
            description,
          },
        })
        .execute();

      return {
        permission: permissionResult[0],
      };
    },

    updatePermission: async ({
      permissionId,
      name,
      description,
    }: IPermissionsSetPermissionParams): Promise<{ permission: IPermissionsSetPermissionResult | undefined }> => {
      const [permissionResult] = await db.transaction()
        .add<IPermissionsSetPermissionResult>({
          files: [updatePermissionQuery],
          params: {
            permissionId,
            name,
            description,
          },
        })
        .execute();

      return {
        permission: permissionResult[0],
      };
    },

    removePermission: async ({
      permissionId,
    }: IPermissionsRemovePermissionParams): Promise<{ permission: IPermissionsRemovePermissionResult | undefined }> => {
      const [permissionResult] = await db.transaction()
        .add<IPermissionsRemovePermissionResult>({
          files: [removePermissionQuery],
          params: {
            permissionId,
          },
        })
        .execute();

      return {
        permission: permissionResult[0],
      };
    },
  };
}

type PermissionsRepository = ReturnType<typeof createPermissionsRepository>;

export type { PermissionsRepository };
export { createPermissionsRepository };
