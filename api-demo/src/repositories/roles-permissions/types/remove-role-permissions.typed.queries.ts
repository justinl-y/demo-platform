/** Types generated for queries found in "src/repositories/roles-permissions/types/remove-role-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesPermissionsRemoveRolePermissions' parameters type */
export interface IRolesPermissionsRemoveRolePermissionsParams {
  roleId: string;
}

/** 'RolesPermissionsRemoveRolePermissions' return type */
export interface IRolesPermissionsRemoveRolePermissionsResult {
  roles_permissions_id: string;
}

/** 'RolesPermissionsRemoveRolePermissions' query type */
export interface IRolesPermissionsRemoveRolePermissionsQuery {
  params: IRolesPermissionsRemoveRolePermissionsParams;
  result: IRolesPermissionsRemoveRolePermissionsResult;
}

const rolesPermissionsRemoveRolePermissionsIR: any = {"usedParamSet":{"roleId":true},"params":[{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":121,"b":128}]}],"statement":"                                                             \nDELETE FROM\n  internal.roles_permissions\nWHERE\n  role_id = :roleId!\nRETURNING\n  id AS roles_permissions_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * DELETE FROM
 *   internal.roles_permissions
 * WHERE
 *   role_id = :roleId!
 * RETURNING
 *   id AS roles_permissions_id
 * ```
 */
export const rolesPermissionsRemoveRolePermissions = new PreparedQuery<IRolesPermissionsRemoveRolePermissionsParams,IRolesPermissionsRemoveRolePermissionsResult>(rolesPermissionsRemoveRolePermissionsIR);


