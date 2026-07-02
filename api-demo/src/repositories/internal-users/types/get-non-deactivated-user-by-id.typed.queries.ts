/** Types generated for queries found in "src/repositories/internal-users/types/get-non-deactivated-user-by-id.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InternalUsersGetNonDeactivatedUserById' parameters type */
export interface IInternalUsersGetNonDeactivatedUserByIdParams {
  userId: string;
}

/** 'InternalUsersGetNonDeactivatedUserById' return type */
export interface IInternalUsersGetNonDeactivatedUserByIdResult {
  user_id: string;
}

/** 'InternalUsersGetNonDeactivatedUserById' query type */
export interface IInternalUsersGetNonDeactivatedUserByIdQuery {
  params: IInternalUsersGetNonDeactivatedUserByIdParams;
  result: IInternalUsersGetNonDeactivatedUserByIdResult;
}

const internalUsersGetNonDeactivatedUserByIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":126,"b":133}]}],"statement":"                                                             \nSELECT\n\tu.id AS user_id\nFROM\n\tinternal.users AS u\nWHERE\n\tu.id = :userId!\n\tAND u.status <> 'DEACTIVATED'"};

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
export const internalUsersGetNonDeactivatedUserById = new PreparedQuery<IInternalUsersGetNonDeactivatedUserByIdParams,IInternalUsersGetNonDeactivatedUserByIdResult>(internalUsersGetNonDeactivatedUserByIdIR);


