/** Types generated for queries found in "src/repositories/users-roles/types/add-user-roles.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'UsersRolesAddUserRoles' parameters type */
export interface IUsersRolesAddUserRolesParams {
  roleIds: stringArray;
  userId: string;
}

/** 'UsersRolesAddUserRoles' return type */
export interface IUsersRolesAddUserRolesResult {
  role_id: string;
}

/** 'UsersRolesAddUserRoles' query type */
export interface IUsersRolesAddUserRolesQuery {
  params: IUsersRolesAddUserRolesParams;
  result: IUsersRolesAddUserRolesResult;
}

const usersRolesAddUserRolesIR: any = {"usedParamSet":{"userId":true,"roleIds":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":138}]},{"name":"roleIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":192,"b":200}]}],"statement":"                                                             \nINSERT INTO internal.users_roles\n\t(\n\t\tuser_id\n\t\t, role_id\n\t)\nSELECT\n\t:userId!\n\t, r.id\nFROM\n\tinternal.roles AS r\nWHERE\n\tr.id = ANY(:roleIds!)\nRETURNING\n\trole_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * INSERT INTO internal.users_roles
 * 	(
 * 		user_id
 * 		, role_id
 * 	)
 * SELECT
 * 	:userId!
 * 	, r.id
 * FROM
 * 	internal.roles AS r
 * WHERE
 * 	r.id = ANY(:roleIds!)
 * RETURNING
 * 	role_id
 * ```
 */
export const usersRolesAddUserRoles = new PreparedQuery<IUsersRolesAddUserRolesParams,IUsersRolesAddUserRolesResult>(usersRolesAddUserRolesIR);


