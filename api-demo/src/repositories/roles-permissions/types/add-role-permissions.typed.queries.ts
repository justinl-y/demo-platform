/** Types generated for queries found in "src/repositories/roles-permissions/types/add-role-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'RolesPermissionsAddRolePermissions' parameters type */
export interface IRolesPermissionsAddRolePermissionsParams {
  permissionIds: stringArray;
  roleId: string;
}

/** 'RolesPermissionsAddRolePermissions' return type */
export interface IRolesPermissionsAddRolePermissionsResult {
  permission_id: string;
}

/** 'RolesPermissionsAddRolePermissions' query type */
export interface IRolesPermissionsAddRolePermissionsQuery {
  params: IRolesPermissionsAddRolePermissionsParams;
  result: IRolesPermissionsAddRolePermissionsResult;
}

const rolesPermissionsAddRolePermissionsIR: any = {"usedParamSet":{"roleId":true,"permissionIds":true},"params":[{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":150}]},{"name":"permissionIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":210,"b":224}]}],"statement":"                                                             \nINSERT INTO internal.roles_permissions\n\t(\n\t\trole_id\n\t\t, permission_id\n\t)\nSELECT\n\t:roleId!\n\t, p.id\nFROM\n\tinternal.permissions AS p\nWHERE\n\tp.id = ANY(:permissionIds!)\nRETURNING\n\tpermission_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * INSERT INTO internal.roles_permissions
 * 	(
 * 		role_id
 * 		, permission_id
 * 	)
 * SELECT
 * 	:roleId!
 * 	, p.id
 * FROM
 * 	internal.permissions AS p
 * WHERE
 * 	p.id = ANY(:permissionIds!)
 * RETURNING
 * 	permission_id
 * ```
 */
export const rolesPermissionsAddRolePermissions = new PreparedQuery<IRolesPermissionsAddRolePermissionsParams,IRolesPermissionsAddRolePermissionsResult>(rolesPermissionsAddRolePermissionsIR);


