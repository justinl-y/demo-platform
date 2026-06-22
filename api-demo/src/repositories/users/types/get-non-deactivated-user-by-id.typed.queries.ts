/** Types generated for queries found in "src/repositories/users/types/get-non-deactivated-user-by-id.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersGetNonDeactivatedUserById' parameters type */
export interface IUsersGetNonDeactivatedUserByIdParams {
  userId: string;
}

/** 'UsersGetNonDeactivatedUserById' return type */
export interface IUsersGetNonDeactivatedUserByIdResult {
  user_id: string;
}

/** 'UsersGetNonDeactivatedUserById' query type */
export interface IUsersGetNonDeactivatedUserByIdQuery {
  params: IUsersGetNonDeactivatedUserByIdParams;
  result: IUsersGetNonDeactivatedUserByIdResult;
}

const usersGetNonDeactivatedUserByIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":133}]}],"statement":"                                                             \nSELECT\n\tu.id AS user_id\nFROM\n\tinternal.users AS u\nWHERE\n\tu.id = :userId!\n\tAND u.status <> 'DEACTIVATED'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	u.id AS user_id
 * FROM
 * 	internal.users AS u
 * WHERE
 * 	u.id = :userId!
 * 	AND u.status <> 'DEACTIVATED'
 * ```
 */
export const usersGetNonDeactivatedUserById = new PreparedQuery<IUsersGetNonDeactivatedUserByIdParams,IUsersGetNonDeactivatedUserByIdResult>(usersGetNonDeactivatedUserByIdIR);


