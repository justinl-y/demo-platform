/** Types generated for queries found in "src/repositories/users/types/get-users.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

export type user_statusArray = (user_status)[];

/** 'UsersGetUsers' parameters type */
export interface IUsersGetUsersParams {
  limit: NumberOrString;
  offset: NumberOrString;
  status?: user_statusArray | null | void;
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

const usersGetUsersIR: any = {"usedParamSet":{"status":true,"userId":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":245,"b":251}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":285,"b":291}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":372,"b":378}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":390,"b":397}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t  u.id\n\t  , u.email\n\t  , u.full_name\n\t  , u.known_as\n\t\t, u.status\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  public.users AS u\n\tWHERE\n\t\tCOALESCE(u.status = ANY(:status), TRUE)\n\t  AND COALESCE((u.id = :userId), TRUE)\n\tORDER BY\n\t\tsplit_part(u.full_name, ' ', -1) ASC\n\t\t, u.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttu.id\n\t\t,json_build_object(\n\t\t\t'email', tu.email\n\t\t\t, 'full_name', tu.full_name\n\t\t\t, 'known_as', tu.known_as\n\t\t\t, 'status', tu.status\n\t\t)\n\t) AS users\n\t, COALESCE(MAX(tu.total), 0)::int AS total\nFROM\n\tt_users AS tu"};

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
 * 		, u.status
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  public.users AS u
 * 	WHERE
 * 		COALESCE(u.status = ANY(:status), TRUE)
 * 	  AND COALESCE((u.id = :userId), TRUE)
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
 * 		tu.id
 * 		,json_build_object(
 * 			'email', tu.email
 * 			, 'full_name', tu.full_name
 * 			, 'known_as', tu.known_as
 * 			, 'status', tu.status
 * 		)
 * 	) AS users
 * 	, COALESCE(MAX(tu.total), 0)::int AS total
 * FROM
 * 	t_users AS tu
 * ```
 */
export const usersGetUsers = new PreparedQuery<IUsersGetUsersParams,IUsersGetUsersResult>(usersGetUsersIR);


