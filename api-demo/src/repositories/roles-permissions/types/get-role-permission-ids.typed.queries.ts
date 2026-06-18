/** Types generated for queries found in "src/repositories/roles-permissions/types/get-role-permission-ids.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'RolesPermissionsGetRolePermissionIds' parameters type */
export interface IRolesPermissionsGetRolePermissionIdsParams {
  permissionIds: stringArray;
  roleId: string;
}

/** 'RolesPermissionsGetRolePermissionIds' return type */
export interface IRolesPermissionsGetRolePermissionIdsResult {
  permission_id: string;
}

/** 'RolesPermissionsGetRolePermissionIds' query type */
export interface IRolesPermissionsGetRolePermissionIdsQuery {
  params: IRolesPermissionsGetRolePermissionIdsParams;
  result: IRolesPermissionsGetRolePermissionIdsResult;
}

const rolesPermissionsGetRolePermissionIdsIR: any = {"usedParamSet":{"roleId":true,"permissionIds":true},"params":[{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":146,"b":153}]},{"name":"permissionIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":197}]}],"statement":"                                                             \nSELECT\n\trp.permission_id\nFROM\n\tinternal.roles_permissions AS rp\nWHERE\n\trp.role_id = :roleId!\n\tAND rp.permission_id = ANY(:permissionIds!)"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	rp.permission_id
 * FROM
 * 	internal.roles_permissions AS rp
 * WHERE
 * 	rp.role_id = :roleId!
 * 	AND rp.permission_id = ANY(:permissionIds!)
 * ```
 */
export const rolesPermissionsGetRolePermissionIds = new PreparedQuery<IRolesPermissionsGetRolePermissionIdsParams,IRolesPermissionsGetRolePermissionIdsResult>(rolesPermissionsGetRolePermissionIdsIR);


