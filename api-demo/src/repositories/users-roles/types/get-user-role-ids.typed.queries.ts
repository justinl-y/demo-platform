/** Types generated for queries found in "src/repositories/users-roles/types/get-user-role-ids.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersRolesGetUserRoleIds' parameters type */
export interface IUsersRolesGetUserRoleIdsParams {
  userId: string;
}

/** 'UsersRolesGetUserRoleIds' return type */
export interface IUsersRolesGetUserRoleIdsResult {
  role_id: string;
}

/** 'UsersRolesGetUserRoleIds' query type */
export interface IUsersRolesGetUserRoleIdsQuery {
  params: IUsersRolesGetUserRoleIdsParams;
  result: IUsersRolesGetUserRoleIdsResult;
}

const usersRolesGetUserRoleIdsIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":141}]}],"statement":"                                                             \nSELECT\n\tur.role_id\nFROM\n\tinternal.users_roles AS ur\nWHERE\n\tur.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	ur.role_id
 * FROM
 * 	internal.users_roles AS ur
 * WHERE
 * 	ur.user_id = :userId!
 * ```
 */
export const usersRolesGetUserRoleIds = new PreparedQuery<IUsersRolesGetUserRoleIdsParams,IUsersRolesGetUserRoleIdsResult>(usersRolesGetUserRoleIdsIR);


