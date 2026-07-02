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

const permissionsGetPermissionsIR: any = {"usedParamSet":{"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":216,"b":222},{"a":247,"b":253}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":805,"b":811},{"a":905,"b":910}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":836,"b":841},{"a":934,"b":938}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1020,"b":1026}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1040,"b":1047}]}],"statement":"                                                             \nWITH t_permissions AS (\n\tSELECT\n\t\tp.id AS permission_id\n\t\t, p.name\n\t\t, p.description\n\tFROM\n\t\tinternal.permissions AS p\n\tWHERE\n\t\tCOALESCE(\n\t\t\tp.name ILIKE :search\n\t\t\tOR p.id::text ILIKE :search\n\t\t, TRUE)\n),\nt_page AS (\n\tSELECT\n\t\tpg.*\n\t\t-- `ord` preserves the requested sort into the JSON array below: the inner\n\t\t-- subquery is ORDER BY-ed then LIMIT/OFFSET-ed, and ROW_NUMBER() OVER () numbers\n\t\t-- rows in that produced order (Postgres carries a subquery's ORDER BY into the\n\t\t-- window step), so json_agg(... ORDER BY tp.ord) re-emits rows in sort order.\n\t\t, ROW_NUMBER() OVER () AS ord\n\tFROM (\n\t\tSELECT\n\t\t\t*\n\t\tFROM\n\t\t\tt_permissions\n\t\tORDER BY\n\t\t\t-- Direction can't be parameterized, so each direction is a separate gated term.\n\t\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\t\tCASE :sort!\n\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\tEND\n\t\t\tEND DESC\n\t\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\t\tCASE :sort\n\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\tEND\n\t\t\tEND ASC\n\t\t\t, permission_id ASC\n\t\tLIMIT\n\t\t\t:limit!\n\t\tOFFSET\n\t\t\t:offset!\n\t) AS pg\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'permission_id', tp.permission_id\n\t\t\t\t, 'name', tp.name\n\t\t\t\t, 'description', tp.description\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS permissions\n\t, COALESCE((SELECT COUNT(*) FROM t_permissions), 0)::int AS total\nFROM\n\tt_page AS tp"};

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
 * t_page AS (
 * 	SELECT
 * 		pg.*
 * 		-- `ord` preserves the requested sort into the JSON array below: the inner
 * 		-- subquery is ORDER BY-ed then LIMIT/OFFSET-ed, and ROW_NUMBER() OVER () numbers
 * 		-- rows in that produced order (Postgres carries a subquery's ORDER BY into the
 * 		-- window step), so json_agg(... ORDER BY tp.ord) re-emits rows in sort order.
 * 		, ROW_NUMBER() OVER () AS ord
 * 	FROM (
 * 		SELECT
 * 			*
 * 		FROM
 * 			t_permissions
 * 		ORDER BY
 * 			-- Direction can't be parameterized, so each direction is a separate gated term.
 * 			CASE WHEN :order! = 'DESC' THEN
 * 				CASE :sort!
 * 					WHEN 'name' THEN name
 * 				END
 * 			END DESC
 * 			, CASE WHEN :order = 'ASC' THEN
 * 				CASE :sort
 * 					WHEN 'name' THEN name
 * 				END
 * 			END ASC
 * 			, permission_id ASC
 * 		LIMIT
 * 			:limit!
 * 		OFFSET
 * 			:offset!
 * 	) AS pg
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


