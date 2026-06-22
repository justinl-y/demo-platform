/** Types generated for queries found in "src/repositories/roles-permissions/types/get-permission-role-ids.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'RolesPermissionsGetPermissionRoleIds' parameters type */
export interface IRolesPermissionsGetPermissionRoleIdsParams {
  permissionId: string;
}

/** 'RolesPermissionsGetPermissionRoleIds' return type */
export interface IRolesPermissionsGetPermissionRoleIdsResult {
  role_id: string;
}

/** 'RolesPermissionsGetPermissionRoleIds' query type */
export interface IRolesPermissionsGetPermissionRoleIdsQuery {
  params: IRolesPermissionsGetPermissionRoleIdsParams;
  result: IRolesPermissionsGetPermissionRoleIdsResult;
}

const rolesPermissionsGetPermissionRoleIdsIR: any = {"usedParamSet":{"permissionId":true},"params":[{"name":"permissionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":146,"b":159}]}],"statement":"                                                             \nSELECT\n\trp.role_id\nFROM\n\tinternal.roles_permissions AS rp\nWHERE\n\trp.permission_id = :permissionId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	rp.role_id
 * FROM
 * 	internal.roles_permissions AS rp
 * WHERE
 * 	rp.permission_id = :permissionId!
 * LIMIT 1
 * ```
 */
export const rolesPermissionsGetPermissionRoleIds = new PreparedQuery<IRolesPermissionsGetPermissionRoleIdsParams,IRolesPermissionsGetPermissionRoleIdsResult>(rolesPermissionsGetPermissionRoleIdsIR);


