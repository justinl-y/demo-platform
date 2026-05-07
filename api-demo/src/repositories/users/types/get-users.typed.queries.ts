/** Types generated for queries found in "src/repositories/users/types/get-users.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

/** 'UsersGetUsers' parameters type */
export interface IUsersGetUsersParams {
  isActive?: boolean | null | void;
  limit?: NumberOrString | null | void;
  offset?: NumberOrString | null | void;
  userId?: string | null | void;
}

/** 'UsersGetUsers' return type */
export interface IUsersGetUsersResult {
  total: number | null;
  users: Json | null;
}

/** 'UsersGetUsers' query type */
export interface IUsersGetUsersQuery {
  params: IUsersGetUsersParams;
  result: IUsersGetUsersResult;
}

const usersGetUsersIR: any = {"usedParamSet":{"isActive":true,"userId":true,"limit":true,"offset":true},"params":[{"name":"isActive","required":false,"transform":{"type":"scalar"},"locs":[{"a":248,"b":256}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":290,"b":296}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":377,"b":382}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":394,"b":400}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t  u.id\n\t  , u.email\n\t  , u.full_name\n\t  , u.known_as\n\t\t, u.is_active\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  public.users AS u\n\tWHERE\n\t\tCOALESCE((u.is_active = :isActive), TRUE)\n\t  AND COALESCE((u.id = :userId), TRUE)\n\tORDER BY\n\t\tsplit_part(u.full_name, ' ', -1) ASC\n\t\t, u.id ASC\n\tLIMIT\n\t\t:limit\n\tOFFSET\n\t\t:offset\n)\nSELECT\n\tjson_object_agg(\n\t\ttu.id\n\t\t,json_build_object(\n\t\t\t'email', tu.email\n\t\t\t, 'full_name', tu.full_name\n\t\t\t, 'known_as', tu.known_as\n\t\t\t, 'is_active', tu.is_active\n\t\t)\n\t) AS users\n\t, COALESCE(MAX(tu.total), 0)::int AS total\nFROM\n\tt_users AS tu"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_users AS (
 * 	SELECT
 * 	  u.id
 * 	  , u.email
 * 	  , u.full_name
 * 	  , u.known_as
 * 		, u.is_active
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  public.users AS u
 * 	WHERE
 * 		COALESCE((u.is_active = :isActive), TRUE)
 * 	  AND COALESCE((u.id = :userId), TRUE)
 * 	ORDER BY
 * 		split_part(u.full_name, ' ', -1) ASC
 * 		, u.id ASC
 * 	LIMIT
 * 		:limit
 * 	OFFSET
 * 		:offset
 * )
 * SELECT
 * 	json_object_agg(
 * 		tu.id
 * 		,json_build_object(
 * 			'email', tu.email
 * 			, 'full_name', tu.full_name
 * 			, 'known_as', tu.known_as
 * 			, 'is_active', tu.is_active
 * 		)
 * 	) AS users
 * 	, COALESCE(MAX(tu.total), 0)::int AS total
 * FROM
 * 	t_users AS tu
 * ```
 */
export const usersGetUsers = new PreparedQuery<IUsersGetUsersParams,IUsersGetUsersResult>(usersGetUsersIR);


