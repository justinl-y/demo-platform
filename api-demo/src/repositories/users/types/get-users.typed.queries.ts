/** Types generated for queries found in "src/repositories/users/types/get-users.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

export type stringArray = (string)[];

/** 'UsersGetUsers' parameters type */
export interface IUsersGetUsersParams {
  limit?: NumberOrString | null | void;
  offset?: NumberOrString | null | void;
  status?: stringArray | null | void;
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

const usersGetUsersIR: any = {"usedParamSet":{"status":true,"userId":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":1143,"b":1149}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1189,"b":1195}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":1276,"b":1281}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":1293,"b":1299}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t  u.id\n\t  , u.email\n\t  , u.full_name\n\t  , u.known_as\n\t\t, CASE\n\t\t\t\tWHEN (u.invited_at IS NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'CREATED'\n\t\t\t\tWHEN (u.invited_at IS NOT NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'INVITED'\n\t\t\t\tWHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NULL) THEN 'ACTIVE'\n\t\t\t\tWHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NOT NULL) THEN 'DEACTIVATED'\n\t\t\tEND AS status\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  public.users AS u\n\tWHERE\n\t\tCOALESCE(\n\t\t\tCASE\n\t\t\t\tWHEN (u.invited_at IS NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'CREATED'\n\t\t\t\tWHEN (u.invited_at IS NOT NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'INVITED'\n\t\t\t\tWHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NULL) THEN 'ACTIVE'\n\t\t\t\tWHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NOT NULL) THEN 'DEACTIVATED'\n\t\t\tEND = ANY(:status),\n\t\t\tTRUE\n\t\t)\n\t  AND COALESCE((u.id = :userId), TRUE)\n\tORDER BY\n\t\tsplit_part(u.full_name, ' ', -1) ASC\n\t\t, u.id ASC\n\tLIMIT\n\t\t:limit\n\tOFFSET\n\t\t:offset\n)\nSELECT\n\tjson_object_agg(\n\t\ttu.id\n\t\t,json_build_object(\n\t\t\t'email', tu.email\n\t\t\t, 'full_name', tu.full_name\n\t\t\t, 'known_as', tu.known_as\n\t\t\t, 'status', tu.status\n\t\t)\n\t) AS users\n\t, COALESCE(MAX(tu.total), 0)::int AS total\nFROM\n\tt_users AS tu"};

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
 * 		, CASE
 * 				WHEN (u.invited_at IS NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'CREATED'
 * 				WHEN (u.invited_at IS NOT NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'INVITED'
 * 				WHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NULL) THEN 'ACTIVE'
 * 				WHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NOT NULL) THEN 'DEACTIVATED'
 * 			END AS status
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  public.users AS u
 * 	WHERE
 * 		COALESCE(
 * 			CASE
 * 				WHEN (u.invited_at IS NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'CREATED'
 * 				WHEN (u.invited_at IS NOT NULL AND u.activated_at IS NULL AND u.deactivated_at IS NULL) THEN 'INVITED'
 * 				WHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NULL) THEN 'ACTIVE'
 * 				WHEN (u.invited_at IS NOT NULL AND u.activated_at IS NOT NULL AND u.deactivated_at IS NOT NULL) THEN 'DEACTIVATED'
 * 			END = ANY(:status),
 * 			TRUE
 * 		)
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
 * 			, 'status', tu.status
 * 		)
 * 	) AS users
 * 	, COALESCE(MAX(tu.total), 0)::int AS total
 * FROM
 * 	t_users AS tu
 * ```
 */
export const usersGetUsers = new PreparedQuery<IUsersGetUsersParams,IUsersGetUsersResult>(usersGetUsersIR);


