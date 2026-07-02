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

const rolesPermissionsGetRolesPermissionsIR: any = {"usedParamSet":{"roleId":true,"limit":true,"offset":true},"params":[{"name":"roleId","required":false,"transform":{"type":"scalar"},"locs":[{"a":184,"b":190}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":358,"b":364}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":378,"b":385}]}],"statement":"                                                             \nWITH t_roles AS (\n\tSELECT\n\t\tr.id AS role_id\n\t\t, r.name AS role_name\n\tFROM\n\t\tinternal.roles AS r\n\tWHERE\n\t\tCOALESCE((r.id = :roleId), TRUE)\n),\nt_page AS (\n\tSELECT\n\t\trg.*\n\t\t, ROW_NUMBER() OVER () AS ord\n\tFROM (\n\t\tSELECT\n\t\t\t*\n\t\tFROM\n\t\t\tt_roles\n\t\tORDER BY\n\t\t\trole_name ASC\n\t\t\t, role_id ASC\n\t\tLIMIT\n\t\t\t:limit!\n\t\tOFFSET\n\t\t\t:offset!\n\t) AS rg\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'role_id', tp.role_id\n\t\t\t\t, 'role_name', tp.role_name\n\t\t\t\t, 'permissions', COALESCE(rp.permissions, '{}'::json)\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS roles\n\t, COALESCE((SELECT COUNT(*) FROM t_roles), 0)::int AS total\nFROM\n\tt_page AS tp\n\tLEFT JOIN LATERAL (\n\t\tSELECT\n\t\t\tjson_object_agg(\n\t\t\t\tp.id\n\t\t\t\t, json_build_object(\n\t\t\t\t\t'permission_id', p.id\n\t\t\t\t\t, 'permission_name', p.name\n\t\t\t\t)\n\t\t\t\tORDER BY\n\t\t\t\t\tp.name ASC\n\t\t\t) AS permissions\n\t\tFROM\n\t\t\tinternal.roles_permissions AS rp\n\t\t\tINNER JOIN internal.permissions AS p ON p.id = rp.permission_id\n\t\tWHERE\n\t\t\trp.role_id = tp.role_id\n\t) AS rp ON TRUE"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_roles AS (
 * 	SELECT
 * 		r.id AS role_id
 * 		, r.name AS role_name
 * 	FROM
 * 		internal.roles AS r
 * 	WHERE
 * 		COALESCE((r.id = :roleId), TRUE)
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
 * 			role_name ASC
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
 * 				, 'role_name', tp.role_name
 * 				, 'permissions', COALESCE(rp.permissions, '{}'::json)
 * 			)
 * 			ORDER BY tp.ord
 * 		)
 * 	, '[]'::json) AS roles
 * 	, COALESCE((SELECT COUNT(*) FROM t_roles), 0)::int AS total
 * FROM
 * 	t_page AS tp
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
 * 			rp.role_id = tp.role_id
 * 	) AS rp ON TRUE
 * ```
 */
export const rolesPermissionsGetRolesPermissions = new PreparedQuery<IRolesPermissionsGetRolesPermissionsParams,IRolesPermissionsGetRolesPermissionsResult>(rolesPermissionsGetRolesPermissionsIR);


