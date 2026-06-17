/** Types generated for queries found in "src/repositories/permissions/types/get-permission-by-name.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'PermissionsGetPermissionByName' parameters type */
export interface IPermissionsGetPermissionByNameParams {
  name: string;
}

/** 'PermissionsGetPermissionByName' return type */
export interface IPermissionsGetPermissionByNameResult {
  permission_id: string;
}

/** 'PermissionsGetPermissionByName' query type */
export interface IPermissionsGetPermissionByNameQuery {
  params: IPermissionsGetPermissionByNameParams;
  result: IPermissionsGetPermissionByNameResult;
}

const permissionsGetPermissionByNameIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":140,"b":145}]}],"statement":"                                                             \nSELECT\n\tp.id AS permission_id\nFROM\n\tinternal.permissions AS p\nWHERE\n\tp.name = :name!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	p.id AS permission_id
 * FROM
 * 	internal.permissions AS p
 * WHERE
 * 	p.name = :name!
 * ```
 */
export const permissionsGetPermissionByName = new PreparedQuery<IPermissionsGetPermissionByNameParams,IPermissionsGetPermissionByNameResult>(permissionsGetPermissionByNameIR);


