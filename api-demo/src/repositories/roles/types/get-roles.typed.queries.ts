/** Types generated for queries found in "src/repositories/roles/types/get-roles.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'RolesGetRoles' parameters type */
export interface IRolesGetRolesParams {
  limit: NumberOrString;
  offset: NumberOrString;
  roleId?: string | null | void;
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

const rolesGetRolesIR: any = {"usedParamSet":{"roleId":true,"limit":true,"offset":true},"params":[{"name":"roleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":224,"b":230}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":285,"b":291}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":303,"b":310}]}],"statement":"                                                             \nWITH t_roles AS (\n\tSELECT\n\t  r.id AS role_id\n\t  , r.name\n\t  , r.description\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.roles AS r\n\tWHERE\n\t  COALESCE((r.id = :roleId), TRUE)\n\tORDER BY\n\t\tr.name ASC\n\t\t, r.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttr.role_id\n\t\t,json_build_object(\n\t\t\t'name', tr.name\n\t\t\t, 'description', tr.description\n\t\t)\n\t) AS roles\n\t, COALESCE(MAX(tr.total), 0)::int AS total\nFROM\n\tt_roles AS tr"};

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
 * 	  COALESCE((r.id = :roleId), TRUE)
 * 	ORDER BY
 * 		r.name ASC
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


