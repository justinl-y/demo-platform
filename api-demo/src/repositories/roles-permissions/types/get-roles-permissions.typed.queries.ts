/** Types generated for queries found in "src/repositories/roles-permissions/types/get-roles-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'RolesPermissionsGetRolesPermissions' parameters type */
export interface IRolesPermissionsGetRolesPermissionsParams {
  limit: NumberOrString;
  offset: NumberOrString;
  roleId?: string | null | void;
}

/** 'RolesPermissionsGetRolesPermissions' return type */
export interface IRolesPermissionsGetRolesPermissionsResult {
  roles: Json | null;
  total: number | null;
}

/** 'RolesPermissionsGetRolesPermissions' query type */
export interface IRolesPermissionsGetRolesPermissionsQuery {
  params: IRolesPermissionsGetRolesPermissionsParams;
  result: IRolesPermissionsGetRolesPermissionsResult;
}

const rolesPermissionsGetRolesPermissionsIR: any = {"usedParamSet":{"roleId":true,"limit":true,"offset":true},"params":[{"name":"roleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":218,"b":224}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":279,"b":285}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":297,"b":304}]}],"statement":"                                                             \nWITH t_roles AS (\n\tSELECT\n\t  r.id AS role_id\n\t  , r.name AS role_name\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.roles AS r\n\tWHERE\n\t  COALESCE((r.id = :roleId), TRUE)\n\tORDER BY\n\t\tr.name ASC\n\t\t, r.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttr.role_id\n\t\t, json_build_object(\n\t\t\t'role_id', tr.role_id\n\t\t\t, 'role_name', tr.role_name\n\t\t\t, 'permissions', COALESCE(rp.permissions, '{}'::json)\n\t\t)\n\t) AS roles\n\t, COALESCE(MAX(tr.total), 0)::int AS total\nFROM\n\tt_roles AS tr\n\tLEFT JOIN LATERAL (\n\t\tSELECT\n\t\t\tjson_object_agg(\n\t\t\t\tp.id\n\t\t\t\t, json_build_object(\n\t\t\t\t\t'permission_id', p.id\n\t\t\t\t\t, 'permission_name', p.name\n\t\t\t\t)\n\t\t\t\tORDER BY\n\t\t\t\t\tp.name ASC\n\t\t\t) AS permissions\n\t\tFROM\n\t\t\tinternal.roles_permissions AS rp\n\t\t\tINNER JOIN internal.permissions AS p ON p.id = rp.permission_id\n\t\tWHERE\n\t\t\trp.role_id = tr.role_id\n\t) AS rp ON TRUE"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_roles AS (
 * 	SELECT
 * 	  r.id AS role_id
 * 	  , r.name AS role_name
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
 * 		, json_build_object(
 * 			'role_id', tr.role_id
 * 			, 'role_name', tr.role_name
 * 			, 'permissions', COALESCE(rp.permissions, '{}'::json)
 * 		)
 * 	) AS roles
 * 	, COALESCE(MAX(tr.total), 0)::int AS total
 * FROM
 * 	t_roles AS tr
 * 	LEFT JOIN LATERAL (
 * 		SELECT
 * 			json_object_agg(
 * 				p.id
 * 				, json_build_object(
 * 					'permission_id', p.id
 * 					, 'permission_name', p.name
 * 				)
 * 				ORDER BY
 * 					p.name ASC
 * 			) AS permissions
 * 		FROM
 * 			internal.roles_permissions AS rp
 * 			INNER JOIN internal.permissions AS p ON p.id = rp.permission_id
 * 		WHERE
 * 			rp.role_id = tr.role_id
 * 	) AS rp ON TRUE
 * ```
 */
export const rolesPermissionsGetRolesPermissions = new PreparedQuery<IRolesPermissionsGetRolesPermissionsParams,IRolesPermissionsGetRolesPermissionsResult>(rolesPermissionsGetRolesPermissionsIR);


