/** Types generated for queries found in "src/repositories/users-roles/types/get-users-roles.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'UsersRolesGetUsersRoles' parameters type */
export interface IUsersRolesGetUsersRolesParams {
  limit: NumberOrString;
  offset: NumberOrString;
  userId?: string | null | void;
}

/** 'UsersRolesGetUsersRoles' return type */
export interface IUsersRolesGetUsersRolesResult {
  total: number | null;
  users: Json | null;
}

/** 'UsersRolesGetUsersRoles' query type */
export interface IUsersRolesGetUsersRolesQuery {
  params: IUsersRolesGetUsersRolesParams;
  result: IUsersRolesGetUsersRolesResult;
}

const usersRolesGetUsersRolesIR: any = {"usedParamSet":{"userId":true,"limit":true,"offset":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":220,"b":226}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":743,"b":749}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":763,"b":770}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t\tu.id AS user_id\n\t\t, u.email AS user_email\n\t\t, u.full_name AS user_full_name\n\tFROM\n\t\tinternal.users AS u\n\tWHERE\n\t\tCOALESCE((u.id = :userId), TRUE)\n),\nt_page AS (\n\tSELECT\n\t\tp.*\n\t\t-- `ord` preserves the requested sort into the JSON array below: the inner\n\t\t-- subquery is ORDER BY-ed then LIMIT/OFFSET-ed, and ROW_NUMBER() OVER () numbers\n\t\t-- rows in that produced order (Postgres carries a subquery's ORDER BY into the\n\t\t-- window step), so json_agg(... ORDER BY tp.ord) re-emits rows in sort order.\n\t\t, ROW_NUMBER() OVER () AS ord\n\tFROM (\n\t\tSELECT\n\t\t\t*\n\t\tFROM\n\t\t\tt_users\n\t\tORDER BY\n\t\t\tsplit_part(user_full_name, ' ', -1) ASC\n\t\t\t, user_id ASC\n\t\tLIMIT\n\t\t\t:limit!\n\t\tOFFSET\n\t\t\t:offset!\n\t) AS p\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'user_id', tp.user_id\n\t\t\t\t, 'user_email', tp.user_email\n\t\t\t\t, 'user_full_name', tp.user_full_name\n\t\t\t\t, 'roles', COALESCE(ur.roles, '{}'::json)\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS users\n\t, COALESCE((SELECT COUNT(*) FROM t_users), 0)::int AS total\nFROM\n\tt_page AS tp\n\tLEFT JOIN LATERAL (\n\t\tSELECT\n\t\t\tjson_object_agg(\n\t\t\t\tr.id\n\t\t\t\t, json_build_object(\n\t\t\t\t\t'role_id', r.id\n\t\t\t\t\t, 'role_name', r.name\n\t\t\t\t)\n\t\t\t\tORDER BY\n\t\t\t\t\tr.name ASC\n\t\t\t) AS roles\n\t\tFROM\n\t\t\tinternal.users_roles AS ur\n\t\t\tINNER JOIN internal.roles AS r ON r.id = ur.role_id\n\t\tWHERE\n\t\t\tur.user_id = tp.user_id\n\t) AS ur ON TRUE"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_users AS (
 * 	SELECT
 * 		u.id AS user_id
 * 		, u.email AS user_email
 * 		, u.full_name AS user_full_name
 * 	FROM
 * 		internal.users AS u
 * 	WHERE
 * 		COALESCE((u.id = :userId), TRUE)
 * ),
 * t_page AS (
 * 	SELECT
 * 		p.*
 * 		-- `ord` preserves the requested sort into the JSON array below: the inner
 * 		-- subquery is ORDER BY-ed then LIMIT/OFFSET-ed, and ROW_NUMBER() OVER () numbers
 * 		-- rows in that produced order (Postgres carries a subquery's ORDER BY into the
 * 		-- window step), so json_agg(... ORDER BY tp.ord) re-emits rows in sort order.
 * 		, ROW_NUMBER() OVER () AS ord
 * 	FROM (
 * 		SELECT
 * 			*
 * 		FROM
 * 			t_users
 * 		ORDER BY
 * 			split_part(user_full_name, ' ', -1) ASC
 * 			, user_id ASC
 * 		LIMIT
 * 			:limit!
 * 		OFFSET
 * 			:offset!
 * 	) AS p
 * )
 * SELECT
 * 	COALESCE(
 * 		json_agg(
 * 			json_build_object(
 * 				'user_id', tp.user_id
 * 				, 'user_email', tp.user_email
 * 				, 'user_full_name', tp.user_full_name
 * 				, 'roles', COALESCE(ur.roles, '{}'::json)
 * 			)
 * 			ORDER BY tp.ord
 * 		)
 * 	, '[]'::json) AS users
 * 	, COALESCE((SELECT COUNT(*) FROM t_users), 0)::int AS total
 * FROM
 * 	t_page AS tp
 * 	LEFT JOIN LATERAL (
 * 		SELECT
 * 			json_object_agg(
 * 				r.id
 * 				, json_build_object(
 * 					'role_id', r.id
 * 					, 'role_name', r.name
 * 				)
 * 				ORDER BY
 * 					r.name ASC
 * 			) AS roles
 * 		FROM
 * 			internal.users_roles AS ur
 * 			INNER JOIN internal.roles AS r ON r.id = ur.role_id
 * 		WHERE
 * 			ur.user_id = tp.user_id
 * 	) AS ur ON TRUE
 * ```
 */
export const usersRolesGetUsersRoles = new PreparedQuery<IUsersRolesGetUsersRolesParams,IUsersRolesGetUsersRolesResult>(usersRolesGetUsersRolesIR);


