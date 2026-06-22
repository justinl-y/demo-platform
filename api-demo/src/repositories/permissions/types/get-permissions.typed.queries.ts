/** Types generated for queries found in "src/repositories/permissions/types/get-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'PermissionsGetPermissions' parameters type */
export interface IPermissionsGetPermissionsParams {
  limit: NumberOrString;
  offset: NumberOrString;
  order: string;
  search?: string | null | void;
  sort: string;
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

const permissionsGetPermissionsIR: any = {"usedParamSet":{"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":250,"b":256},{"a":281,"b":287}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":404,"b":410},{"a":501,"b":506}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":434,"b":439},{"a":529,"b":533}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":602,"b":608}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":620,"b":627}]}],"statement":"                                                             \nWITH t_permissions AS (\n\tSELECT\n\t  p.id AS permission_id\n\t  , p.name\n\t  , p.description\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.permissions AS p\n\tWHERE\n\t\tCOALESCE(\n\t\t\tp.name ILIKE :search\n\t\t\tOR p.id::text ILIKE :search\n\t\t, TRUE)\n\tORDER BY\n\t\t-- Direction can't be parameterized, so each direction is a separate gated term.\n\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\tCASE :sort!\n\t\t\t\tWHEN 'name' THEN p.name\n\t\t\tEND\n\t\tEND DESC\n\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\tCASE :sort\n\t\t\t\tWHEN 'name' THEN p.name\n\t\t\tEND\n\t\tEND ASC\n\t\t, p.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttp.permission_id\n\t\t,json_build_object(\n\t\t\t'name', tp.name\n\t\t\t, 'description', tp.description\n\t\t)\n\t) AS permissions\n\t, COALESCE(MAX(tp.total), 0)::int AS total\nFROM\n\tt_permissions AS tp"};

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
 * 		COALESCE(
 * 			p.name ILIKE :search
 * 			OR p.id::text ILIKE :search
 * 		, TRUE)
 * 	ORDER BY
 * 		-- Direction can't be parameterized, so each direction is a separate gated term.
 * 		CASE WHEN :order! = 'DESC' THEN
 * 			CASE :sort!
 * 				WHEN 'name' THEN p.name
 * 			END
 * 		END DESC
 * 		, CASE WHEN :order = 'ASC' THEN
 * 			CASE :sort
 * 				WHEN 'name' THEN p.name
 * 			END
 * 		END ASC
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


