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

const permissionsGetPermissionsIR: any = {"usedParamSet":{"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":216,"b":222},{"a":247,"b":253}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":671,"b":677},{"a":776,"b":781}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":703,"b":708},{"a":806,"b":810}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":987,"b":993}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1005,"b":1012}]}],"statement":"                                                             \nWITH t_permissions AS (\n\tSELECT\n\t\tp.id AS permission_id\n\t\t, p.name\n\t\t, p.description\n\tFROM\n\t\tinternal.permissions AS p\n\tWHERE\n\t\tCOALESCE(\n\t\t\tp.name ILIKE :search\n\t\t\tOR p.id::text ILIKE :search\n\t\t, TRUE)\n),\nt_ranked AS (\n\t-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON\n\t-- array below both order by this rank, so the result order is deterministic —\n\t-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.\n\tSELECT\n\t\t*\n\t\t, ROW_NUMBER() OVER (\n\t\t\t-- Direction can't be parameterized, so each direction is a separate gated term.\n\t\t\tORDER BY\n\t\t\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\t\t\tCASE :sort!\n\t\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\t\tEND\n\t\t\t\tEND DESC\n\t\t\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\t\t\tCASE :sort\n\t\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\t\tEND\n\t\t\t\tEND ASC\n\t\t\t\t, permission_id ASC\n\t\t) AS ord\n\tFROM\n\t\tt_permissions\n),\nt_page AS (\n\tSELECT\n\t\t*\n\tFROM\n\t\tt_ranked\n\tORDER BY\n\t\tord\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'permission_id', tp.permission_id\n\t\t\t\t, 'name', tp.name\n\t\t\t\t, 'description', tp.description\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS permissions\n\t, COALESCE((SELECT COUNT(*) FROM t_permissions), 0)::int AS total\nFROM\n\tt_page AS tp"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_permissions AS (
 * 	SELECT
 * 		p.id AS permission_id
 * 		, p.name
 * 		, p.description
 * 	FROM
 * 		internal.permissions AS p
 * 	WHERE
 * 		COALESCE(
 * 			p.name ILIKE :search
 * 			OR p.id::text ILIKE :search
 * 		, TRUE)
 * ),
 * t_ranked AS (
 * 	-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON
 * 	-- array below both order by this rank, so the result order is deterministic —
 * 	-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.
 * 	SELECT
 * 		*
 * 		, ROW_NUMBER() OVER (
 * 			-- Direction can't be parameterized, so each direction is a separate gated term.
 * 			ORDER BY
 * 				CASE WHEN :order! = 'DESC' THEN
 * 					CASE :sort!
 * 						WHEN 'name' THEN name
 * 					END
 * 				END DESC
 * 				, CASE WHEN :order = 'ASC' THEN
 * 					CASE :sort
 * 						WHEN 'name' THEN name
 * 					END
 * 				END ASC
 * 				, permission_id ASC
 * 		) AS ord
 * 	FROM
 * 		t_permissions
 * ),
 * t_page AS (
 * 	SELECT
 * 		*
 * 	FROM
 * 		t_ranked
 * 	ORDER BY
 * 		ord
 * 	LIMIT
 * 		:limit!
 * 	OFFSET
 * 		:offset!
 * )
 * SELECT
 * 	COALESCE(
 * 		json_agg(
 * 			json_build_object(
 * 				'permission_id', tp.permission_id
 * 				, 'name', tp.name
 * 				, 'description', tp.description
 * 			)
 * 			ORDER BY tp.ord
 * 		)
 * 	, '[]'::json) AS permissions
 * 	, COALESCE((SELECT COUNT(*) FROM t_permissions), 0)::int AS total
 * FROM
 * 	t_page AS tp
 * ```
 */
export const permissionsGetPermissions = new PreparedQuery<IPermissionsGetPermissionsParams,IPermissionsGetPermissionsResult>(permissionsGetPermissionsIR);


