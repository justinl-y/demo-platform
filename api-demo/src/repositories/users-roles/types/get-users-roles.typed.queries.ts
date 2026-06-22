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

const usersRolesGetUsersRolesIR: any = {"usedParamSet":{"userId":true,"limit":true,"offset":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":255,"b":261}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":342,"b":348}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":360,"b":367}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t  u.id AS user_id\n\t  , u.email AS user_email\n\t  , u.full_name AS user_full_name\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.users AS u\n\tWHERE\n\t  COALESCE((u.id = :userId), TRUE)\n\tORDER BY\n\t\tsplit_part(u.full_name, ' ', -1) ASC\n\t\t, u.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttu.user_id\n\t\t, json_build_object(\n\t\t\t'user_id', tu.user_id\n\t\t\t, 'user_email', tu.user_email\n\t\t\t, 'user_full_name', tu.user_full_name\n\t\t\t, 'roles', COALESCE(ur.roles, '{}'::json)\n\t\t)\n\t) AS users\n\t, COALESCE(MAX(tu.total), 0)::int AS total\nFROM\n\tt_users AS tu\n\tLEFT JOIN LATERAL (\n\t\tSELECT\n\t\t\tjson_object_agg(\n\t\t\t\tr.id\n\t\t\t\t, json_build_object(\n\t\t\t\t\t'role_id', r.id\n\t\t\t\t\t, 'role_name', r.name\n\t\t\t\t)\n\t\t\t\tORDER BY\n\t\t\t\t\tr.name ASC\n\t\t\t) AS roles\n\t\tFROM\n\t\t\tinternal.users_roles AS ur\n\t\t\tINNER JOIN internal.roles AS r ON r.id = ur.role_id\n\t\tWHERE\n\t\t\tur.user_id = tu.user_id\n\t) AS ur ON TRUE"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_users AS (
 * 	SELECT
 * 	  u.id AS user_id
 * 	  , u.email AS user_email
 * 	  , u.full_name AS user_full_name
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  internal.users AS u
 * 	WHERE
 * 	  COALESCE((u.id = :userId), TRUE)
 * 	ORDER BY
 * 		split_part(u.full_name, ' ', -1) ASC
 * 		, u.id ASC
 * 	LIMIT
 * 		:limit!
 * 	OFFSET
 * 		:offset!
 * )
 * SELECT
 * 	json_object_agg(
 * 		tu.user_id
 * 		, json_build_object(
 * 			'user_id', tu.user_id
 * 			, 'user_email', tu.user_email
 * 			, 'user_full_name', tu.user_full_name
 * 			, 'roles', COALESCE(ur.roles, '{}'::json)
 * 		)
 * 	) AS users
 * 	, COALESCE(MAX(tu.total), 0)::int AS total
 * FROM
 * 	t_users AS tu
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
 * 			ur.user_id = tu.user_id
 * 	) AS ur ON TRUE
 * ```
 */
export const usersRolesGetUsersRoles = new PreparedQuery<IUsersRolesGetUsersRolesParams,IUsersRolesGetUsersRolesResult>(usersRolesGetUsersRolesIR);


