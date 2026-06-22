/** Types generated for queries found in "src/repositories/users-roles/types/get-role-user-ids.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersRolesGetRoleUserIds' parameters type */
export interface IUsersRolesGetRoleUserIdsParams {
  roleId: string;
}

/** 'UsersRolesGetRoleUserIds' return type */
export interface IUsersRolesGetRoleUserIdsResult {
  user_id: string;
}

/** 'UsersRolesGetRoleUserIds' query type */
export interface IUsersRolesGetRoleUserIdsQuery {
  params: IUsersRolesGetRoleUserIdsParams;
  result: IUsersRolesGetRoleUserIdsResult;
}

const usersRolesGetRoleUserIdsIR: any = {"usedParamSet":{"roleId":true},"params":[{"name":"roleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":141}]}],"statement":"                                                             \nSELECT\n\tur.user_id\nFROM\n\tinternal.users_roles AS ur\nWHERE\n\tur.role_id = :roleId!\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	ur.user_id
 * FROM
 * 	internal.users_roles AS ur
 * WHERE
 * 	ur.role_id = :roleId!
 * LIMIT 1
 * ```
 */
export const usersRolesGetRoleUserIds = new PreparedQuery<IUsersRolesGetRoleUserIdsParams,IUsersRolesGetRoleUserIdsResult>(usersRolesGetRoleUserIdsIR);


