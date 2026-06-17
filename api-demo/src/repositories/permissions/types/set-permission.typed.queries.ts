/** Types generated for queries found in "src/repositories/permissions/types/set-permission.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'PermissionsSetPermission' parameters type */
export interface IPermissionsSetPermissionParams {
  description?: string | null | void;
  name: string;
  permissionId: string;
}

/** 'PermissionsSetPermission' return type */
export interface IPermissionsSetPermissionResult {
  description: string;
  name: string;
  permission_id: string;
}

/** 'PermissionsSetPermission' query type */
export interface IPermissionsSetPermissionQuery {
  params: IPermissionsSetPermissionParams;
  result: IPermissionsSetPermissionResult;
}

const permissionsSetPermissionIR: any = {"usedParamSet":{"name":true,"description":true,"permissionId":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":110}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":130,"b":141}]},{"name":"permissionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":169}]}],"statement":"                                                             \nUPDATE\n  internal.permissions\nSET\n  name = :name!\n  , description = :description\nWHERE\n  id = :permissionId!\nRETURNING\n  id AS permission_id\n  , name\n  , description"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.permissions
 * SET
 *   name = :name!
 *   , description = :description
 * WHERE
 *   id = :permissionId!
 * RETURNING
 *   id AS permission_id
 *   , name
 *   , description
 * ```
 */
export const permissionsSetPermission = new PreparedQuery<IPermissionsSetPermissionParams,IPermissionsSetPermissionResult>(permissionsSetPermissionIR);


