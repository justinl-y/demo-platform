/** Types generated for queries found in "src/repositories/permissions/types/remove-permission.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'PermissionsRemovePermission' parameters type */
export interface IPermissionsRemovePermissionParams {
  permissionId: string;
}

/** 'PermissionsRemovePermission' return type */
export interface IPermissionsRemovePermissionResult {
  permission_id: string;
}

/** 'PermissionsRemovePermission' query type */
export interface IPermissionsRemovePermissionQuery {
  params: IPermissionsRemovePermissionParams;
  result: IPermissionsRemovePermissionResult;
}

const permissionsRemovePermissionIR: any = {"usedParamSet":{"permissionId":true},"params":[{"name":"permissionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":110,"b":123}]}],"statement":"                                                             \nDELETE FROM\n  internal.permissions\nWHERE\n  id = :permissionId!\nRETURNING\n  id AS permission_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * DELETE FROM
 *   internal.permissions
 * WHERE
 *   id = :permissionId!
 * RETURNING
 *   id AS permission_id
 * ```
 */
export const permissionsRemovePermission = new PreparedQuery<IPermissionsRemovePermissionParams,IPermissionsRemovePermissionResult>(permissionsRemovePermissionIR);


