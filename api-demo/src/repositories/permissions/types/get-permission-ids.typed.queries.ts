/** Types generated for queries found in "src/repositories/permissions/types/get-permission-ids.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'PermissionsGetPermissionIds' parameters type */
export interface IPermissionsGetPermissionIdsParams {
  permissionIds: stringArray;
}

/** 'PermissionsGetPermissionIds' return type */
export interface IPermissionsGetPermissionIdsResult {
  permission_id: string;
}

/** 'PermissionsGetPermissionIds' query type */
export interface IPermissionsGetPermissionIdsQuery {
  params: IPermissionsGetPermissionIdsParams;
  result: IPermissionsGetPermissionIdsResult;
}

const permissionsGetPermissionIdsIR: any = {"usedParamSet":{"permissionIds":true},"params":[{"name":"permissionIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":156}]}],"statement":"                                                             \nSELECT\n\tp.id AS permission_id\nFROM\n\tinternal.permissions AS p\nWHERE\n\tp.id = ANY(:permissionIds!)"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	p.id AS permission_id
 * FROM
 * 	internal.permissions AS p
 * WHERE
 * 	p.id = ANY(:permissionIds!)
 * ```
 */
export const permissionsGetPermissionIds = new PreparedQuery<IPermissionsGetPermissionIdsParams,IPermissionsGetPermissionIdsResult>(permissionsGetPermissionIdsIR);


