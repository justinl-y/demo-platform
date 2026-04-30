/** Types generated for queries found in "src/repositories/users/types/get-users.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UsersGetUsers' parameters type */
export interface IUsersGetUsersParams {
  userId?: string | null | void;
}

/** 'UsersGetUsers' return type */
export interface IUsersGetUsersResult {
  users: Json | null;
}

/** 'UsersGetUsers' query type */
export interface IUsersGetUsersQuery {
  params: IUsersGetUsersParams;
  result: IUsersGetUsersResult;
}

const usersGetUsersIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":222,"b":228}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t  u.id\n\t  , u.email\n\t  , u.full_name\n\t  , u.known_as\n\tFROM\n\t  public.users AS u\n\tWHERE\n\t  u.is_active = TRUE\n\t  AND COALESCE((u.id = :userId), TRUE)\n)\nSELECT\n\tjson_object_agg(\n\t\ttu.id\n\t\t,json_build_object(\n\t\t\t'email', tu.email\n\t\t\t, 'full_name', tu.full_name\n\t\t\t, 'known_as', tu.known_as \n\t\t)\n\t) AS users\nFROM \n\tt_users AS tu"};

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
 * 	FROM
 * 	  public.users AS u
 * 	WHERE
 * 	  u.is_active = TRUE
 * 	  AND COALESCE((u.id = :userId), TRUE)
 * )
 * SELECT
 * 	json_object_agg(
 * 		tu.id
 * 		,json_build_object(
 * 			'email', tu.email
 * 			, 'full_name', tu.full_name
 * 			, 'known_as', tu.known_as 
 * 		)
 * 	) AS users
 * FROM 
 * 	t_users AS tu
 * ```
 */
export const usersGetUsers = new PreparedQuery<IUsersGetUsersParams,IUsersGetUsersResult>(usersGetUsersIR);


