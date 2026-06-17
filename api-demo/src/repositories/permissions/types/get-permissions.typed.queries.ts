/** Types generated for queries found in "src/repositories/permissions/types/get-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'PermissionsGetPermissions' parameters type */
export interface IPermissionsGetPermissionsParams {
  limit: NumberOrString;
  offset: NumberOrString;
  permissionId?: string | null | void;
}

/** 'PermissionsGetPermissions' return type */
export interface IPermissionsGetPermissionsResult {
  permissions: Json | null;
  total: number | null;
}

/** 'PermissionsGetPermissions' query type */
export interface IPermissionsGetPermissionsQuery {
  params: IPermissionsGetPermissionsParams;
  result: IPermissionsGetPermissionsResult;
}

const permissionsGetPermissionsIR: any = {"usedParamSet":{"permissionId":true,"limit":true,"offset":true},"params":[{"name":"permissionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":242,"b":254}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":309,"b":315}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":327,"b":334}]}],"statement":"                                                             \nWITH t_permissions AS (\n\tSELECT\n\t  p.id AS permission_id\n\t  , p.name\n\t  , p.description\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.permissions AS p\n\tWHERE\n\t  COALESCE((p.id = :permissionId), TRUE)\n\tORDER BY\n\t\tp.name ASC\n\t\t, p.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttp.permission_id\n\t\t,json_build_object(\n\t\t\t'name', tp.name\n\t\t\t, 'description', tp.description\n\t\t)\n\t) AS permissions\n\t, COALESCE(MAX(tp.total), 0)::int AS total\nFROM\n\tt_permissions AS tp"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_permissions AS (
 * 	SELECT
 * 	  p.id AS permission_id
 * 	  , p.name
 * 	  , p.description
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  internal.permissions AS p
 * 	WHERE
 * 	  COALESCE((p.id = :permissionId), TRUE)
 * 	ORDER BY
 * 		p.name ASC
 * 		, p.id ASC
 * 	LIMIT
 * 		:limit!
 * 	OFFSET
 * 		:offset!
 * )
 * SELECT
 * 	json_object_agg(
 * 		tp.permission_id
 * 		,json_build_object(
 * 			'name', tp.name
 * 			, 'description', tp.description
 * 		)
 * 	) AS permissions
 * 	, COALESCE(MAX(tp.total), 0)::int AS total
 * FROM
 * 	t_permissions AS tp
 * ```
 */
export const permissionsGetPermissions = new PreparedQuery<IPermissionsGetPermissionsParams,IPermissionsGetPermissionsResult>(permissionsGetPermissionsIR);


