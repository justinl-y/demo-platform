import { cwd } from '#utils/functions';

import type { DatabaseDecorator } from '../../types/database.ts';
import type { IRolesGetRolesParams, IRolesGetRolesResult } from './types/get-roles.typed.queries.ts';
import type { IRolesGetRoleByNameParams, IRolesGetRoleByNameResult } from './types/get-role-by-name.typed.queries.ts';
import type { IRolesGetRoleByIdParams, IRolesGetRoleByIdResult } from './types/get-role-by-id.typed.queries.ts';
import type { IRolesGetRoleIdsParams, IRolesGetRoleIdsResult } from './types/get-role-ids.typed.queries.ts';
import type { IRolesAddRoleParams, IRolesAddRoleResult } from './types/add-role.typed.queries.ts';
import type { IRolesSetRoleParams, IRolesSetRoleResult } from './types/set-role.typed.queries.ts';
import type { IRolesRemoveRoleParams, IRolesRemoveRoleResult } from './types/remove-role.typed.queries.ts';

const relPath = import.meta.dirname;
const getRolesQuery = cwd('get-roles', relPath);
const getRoleByNameQuery = cwd('get-role-by-name', relPath);
const getRoleByIdQuery = cwd('get-role-by-id', relPath);
const getRoleIdsQuery = cwd('get-role-ids', relPath);
const addRoleQuery = cwd('add-role', relPath);
const updateRoleQuery = cwd('set-role', relPath);
const removeRoleQuery = cwd('remove-role', relPath);

function createRolesRepository(db: DatabaseDecorator) {
  return {
    getRoles: ({
      roleId,
      limit,
      offset,
    }: IRolesGetRolesParams) => {
      const queryParams = {
        roleId,
        limit,
        offset,
      };

      return db.query<IRolesGetRolesResult>(getRolesQuery, queryParams, 'one');
    },

    getRoleByName: ({
      name,
    }: IRolesGetRoleByNameParams) => {
      return db.query<IRolesGetRoleByNameResult>(getRoleByNameQuery, { name }, 'one');
    },

    getRoleById: ({
      roleId,
    }: IRolesGetRoleByIdParams) => {
      return db.query<IRolesGetRoleByIdResult>(getRoleByIdQuery, { roleId }, 'one');
    },

    getRoleIds: ({
      roleIds,
    }: IRolesGetRoleIdsParams) => {
      return db.query<IRolesGetRoleIdsResult>(getRoleIdsQuery, { roleIds }, 'collection');
    },

    addRole: async ({
      name,
      description,
    }: IRolesAddRoleParams): Promise<{ role: IRolesAddRoleResult }> => {
      const [roleResult] = await db.transaction()
        .add<IRolesAddRoleResult>({
          files: [addRoleQuery],
          params: {
            name,
            description,
          },
        })
        .execute();

      return {
        role: roleResult[0],
      };
    },

    updateRole: async ({
      roleId,
      name,
      description,
    }: IRolesSetRoleParams): Promise<{ role: IRolesSetRoleResult | undefined }> => {
      const [roleResult] = await db.transaction()
        .add<IRolesSetRoleResult>({
          files: [updateRoleQuery],
          params: {
            roleId,
            name,
            description,
          },
        })
        .execute();

      return {
        role: roleResult[0],
      };
    },

    removeRole: async ({
      roleId,
    }: IRolesRemoveRoleParams): Promise<{ role: IRolesRemoveRoleResult | undefined }> => {
      const [roleResult] = await db.transaction()
        .add<IRolesRemoveRoleResult>({
          files: [removeRoleQuery],
          params: {
            roleId,
          },
        })
        .execute();

      return {
        role: roleResult[0],
      };
    },
  };
}

type RolesRepository = ReturnType<typeof createRolesRepository>;

export type { RolesRepository };
export { createRolesRepository };
