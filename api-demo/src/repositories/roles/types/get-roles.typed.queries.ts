/** Types generated for queries found in "src/repositories/roles/types/get-roles.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'RolesGetRoles' parameters type */
export interface IRolesGetRolesParams {
  limit: NumberOrString;
  offset: NumberOrString;
  order: string;
  search?: string | null | void;
  sort: string;
}

/** 'RolesGetRoles' return type */
export interface IRolesGetRolesResult {
  roles: Json | null;
  total: number | null;
}

/** 'RolesGetRoles' query type */
export interface IRolesGetRolesQuery {
  params: IRolesGetRolesParams;
  result: IRolesGetRolesResult;
}

const rolesGetRolesIR: any = {"usedParamSet":{"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":198,"b":204},{"a":229,"b":235}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":653,"b":659},{"a":758,"b":763}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":685,"b":690},{"a":788,"b":792}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":957,"b":963}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":975,"b":982}]}],"statement":"                                                             \nWITH t_roles AS (\n\tSELECT\n\t\tr.id AS role_id\n\t\t, r.name\n\t\t, r.description\n\tFROM\n\t\tinternal.roles AS r\n\tWHERE\n\t\tCOALESCE(\n\t\t\tr.name ILIKE :search\n\t\t\tOR r.id::text ILIKE :search\n\t\t, TRUE)\n),\nt_ranked AS (\n\t-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON\n\t-- array below both order by this rank, so the result order is deterministic —\n\t-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.\n\tSELECT\n\t\t*\n\t\t, ROW_NUMBER() OVER (\n\t\t\t-- Direction can't be parameterized, so each direction is a separate gated term.\n\t\t\tORDER BY\n\t\t\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\t\t\tCASE :sort!\n\t\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\t\tEND\n\t\t\t\tEND DESC\n\t\t\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\t\t\tCASE :sort\n\t\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\t\tEND\n\t\t\t\tEND ASC\n\t\t\t\t, role_id ASC\n\t\t) AS ord\n\tFROM\n\t\tt_roles\n),\nt_page AS (\n\tSELECT\n\t\t*\n\tFROM\n\t\tt_ranked\n\tORDER BY\n\t\tord\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'role_id', tp.role_id\n\t\t\t\t, 'name', tp.name\n\t\t\t\t, 'description', tp.description\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS roles\n\t, COALESCE((SELECT COUNT(*) FROM t_roles), 0)::int AS total\nFROM\n\tt_page AS tp"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_roles AS (
 * 	SELECT
 * 		r.id AS role_id
 * 		, r.name
 * 		, r.description
 * 	FROM
 * 		internal.roles AS r
 * 	WHERE
 * 		COALESCE(
 * 			r.name ILIKE :search
 * 			OR r.id::text ILIKE :search
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
 * 				, role_id ASC
 * 		) AS ord
 * 	FROM
 * 		t_roles
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
 * 				'role_id', tp.role_id
 * 				, 'name', tp.name
 * 				, 'description', tp.description
 * 			)
 * 			ORDER BY tp.ord
 * 		)
 * 	, '[]'::json) AS roles
 * 	, COALESCE((SELECT COUNT(*) FROM t_roles), 0)::int AS total
 * FROM
 * 	t_page AS tp
 * ```
 */
export const rolesGetRoles = new PreparedQuery<IRolesGetRolesParams,IRolesGetRolesResult>(rolesGetRolesIR);


