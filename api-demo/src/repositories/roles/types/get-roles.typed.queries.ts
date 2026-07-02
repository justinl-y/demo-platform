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

const rolesGetRolesIR: any = {"usedParamSet":{"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":198,"b":204},{"a":229,"b":235}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":457,"b":463},{"a":557,"b":562}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":488,"b":493},{"a":586,"b":590}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":666,"b":672}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":686,"b":693}]}],"statement":"                                                             \nWITH t_roles AS (\n\tSELECT\n\t\tr.id AS role_id\n\t\t, r.name\n\t\t, r.description\n\tFROM\n\t\tinternal.roles AS r\n\tWHERE\n\t\tCOALESCE(\n\t\t\tr.name ILIKE :search\n\t\t\tOR r.id::text ILIKE :search\n\t\t, TRUE)\n),\nt_page AS (\n\tSELECT\n\t\trg.*\n\t\t, ROW_NUMBER() OVER () AS ord\n\tFROM (\n\t\tSELECT\n\t\t\t*\n\t\tFROM\n\t\t\tt_roles\n\t\tORDER BY\n\t\t\t-- Direction can't be parameterized, so each direction is a separate gated term.\n\t\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\t\tCASE :sort!\n\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\tEND\n\t\t\tEND DESC\n\t\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\t\tCASE :sort\n\t\t\t\t\tWHEN 'name' THEN name\n\t\t\t\tEND\n\t\t\tEND ASC\n\t\t\t, role_id ASC\n\t\tLIMIT\n\t\t\t:limit!\n\t\tOFFSET\n\t\t\t:offset!\n\t) AS rg\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'role_id', tp.role_id\n\t\t\t\t, 'name', tp.name\n\t\t\t\t, 'description', tp.description\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS roles\n\t, COALESCE((SELECT COUNT(*) FROM t_roles), 0)::int AS total\nFROM\n\tt_page AS tp"};

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
 * t_page AS (
 * 	SELECT
 * 		rg.*
 * 		, ROW_NUMBER() OVER () AS ord
 * 	FROM (
 * 		SELECT
 * 			*
 * 		FROM
 * 			t_roles
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
 * 			, role_id ASC
 * 		LIMIT
 * 			:limit!
 * 		OFFSET
 * 			:offset!
 * 	) AS rg
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


