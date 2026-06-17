/** Types generated for queries found in "src/repositories/permissions/types/add-permission.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'PermissionsAddPermission' parameters type */
export interface IPermissionsAddPermissionParams {
  description?: string | null | void;
  name: string;
}

/** 'PermissionsAddPermission' return type */
export interface IPermissionsAddPermissionResult {
  description: string;
  name: string;
  permission_id: string;
}

/** 'PermissionsAddPermission' query type */
export interface IPermissionsAddPermissionQuery {
  params: IPermissionsAddPermissionParams;
  result: IPermissionsAddPermissionResult;
}

const permissionsAddPermissionIR: any = {"usedParamSet":{"name":true,"description":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":141}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":147,"b":158}]}],"statement":"                                                             \nINSERT INTO internal.permissions\n\t(\n\t\tname\n\t\t, description\n\t)\nVALUES\n\t(\n\t\t:name!\n\t\t, :description\n\t)\nRETURNING\n\tid AS permission_id\n\t, name\n\t, description"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * INSERT INTO internal.permissions
 * 	(
 * 		name
 * 		, description
 * 	)
 * VALUES
 * 	(
 * 		:name!
 * 		, :description
 * 	)
 * RETURNING
 * 	id AS permission_id
 * 	, name
 * 	, description
 * ```
 */
export const permissionsAddPermission = new PreparedQuery<IPermissionsAddPermissionParams,IPermissionsAddPermissionResult>(permissionsAddPermissionIR);


