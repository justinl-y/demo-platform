/** Types generated for queries found in "src/repositories/users-roles/types/remove-user-roles.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersRolesRemoveUserRoles' parameters type */
export interface IUsersRolesRemoveUserRolesParams {
  userId: string;
}

/** 'UsersRolesRemoveUserRoles' return type */
export interface IUsersRolesRemoveUserRolesResult {
  users_roles_id: string;
}

/** 'UsersRolesRemoveUserRoles' query type */
export interface IUsersRolesRemoveUserRolesQuery {
  params: IUsersRolesRemoveUserRolesParams;
  result: IUsersRolesRemoveUserRolesResult;
}

const usersRolesRemoveUserRolesIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":120}]}],"statement":"                                                             \nDELETE FROM\n\tinternal.users_roles\nWHERE\n\tuser_id = :userId!\nRETURNING\n\tid AS users_roles_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * DELETE FROM
 * 	internal.users_roles
 * WHERE
 * 	user_id = :userId!
 * RETURNING
 * 	id AS users_roles_id
 * ```
 */
export const usersRolesRemoveUserRoles = new PreparedQuery<IUsersRolesRemoveUserRolesParams,IUsersRolesRemoveUserRolesResult>(usersRolesRemoveUserRolesIR);


