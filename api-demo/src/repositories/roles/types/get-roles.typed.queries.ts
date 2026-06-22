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

const rolesGetRolesIR: any = {"usedParamSet":{"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":232,"b":238},{"a":263,"b":269}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":386,"b":392},{"a":483,"b":488}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":416,"b":421},{"a":511,"b":515}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":584,"b":590}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":602,"b":609}]}],"statement":"                                                             \nWITH t_roles AS (\n\tSELECT\n\t  r.id AS role_id\n\t  , r.name\n\t  , r.description\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.roles AS r\n\tWHERE\n\t\tCOALESCE(\n\t\t\tr.name ILIKE :search\n\t\t\tOR r.id::text ILIKE :search\n\t\t, TRUE)\n\tORDER BY\n\t\t-- Direction can't be parameterized, so each direction is a separate gated term.\n\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\tCASE :sort!\n\t\t\t\tWHEN 'name' THEN r.name\n\t\t\tEND\n\t\tEND DESC\n\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\tCASE :sort\n\t\t\t\tWHEN 'name' THEN r.name\n\t\t\tEND\n\t\tEND ASC\n\t\t, r.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttr.role_id\n\t\t,json_build_object(\n\t\t\t'name', tr.name\n\t\t\t, 'description', tr.description\n\t\t)\n\t) AS roles\n\t, COALESCE(MAX(tr.total), 0)::int AS total\nFROM\n\tt_roles AS tr"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_roles AS (
 * 	SELECT
 * 	  r.id AS role_id
 * 	  , r.name
 * 	  , r.description
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  internal.roles AS r
 * 	WHERE
 * 		COALESCE(
 * 			r.name ILIKE :search
 * 			OR r.id::text ILIKE :search
 * 		, TRUE)
 * 	ORDER BY
 * 		-- Direction can't be parameterized, so each direction is a separate gated term.
 * 		CASE WHEN :order! = 'DESC' THEN
 * 			CASE :sort!
 * 				WHEN 'name' THEN r.name
 * 			END
 * 		END DESC
 * 		, CASE WHEN :order = 'ASC' THEN
 * 			CASE :sort
 * 				WHEN 'name' THEN r.name
 * 			END
 * 		END ASC
 * 		, r.id ASC
 * 	LIMIT
 * 		:limit!
 * 	OFFSET
 * 		:offset!
 * )
 * SELECT
 * 	json_object_agg(
 * 		tr.role_id
 * 		,json_build_object(
 * 			'name', tr.name
 * 			, 'description', tr.description
 * 		)
 * 	) AS roles
 * 	, COALESCE(MAX(tr.total), 0)::int AS total
 * FROM
 * 	t_roles AS tr
 * ```
 */
export const rolesGetRoles = new PreparedQuery<IRolesGetRolesParams,IRolesGetRolesResult>(rolesGetRolesIR);


