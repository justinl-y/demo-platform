/** Types generated for queries found in "src/repositories/internal-users/types/remove-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InternalUsersRemoveUser' parameters type */
export interface IInternalUsersRemoveUserParams {
  userId: string;
}

/** 'InternalUsersRemoveUser' return type */
export interface IInternalUsersRemoveUserResult {
  user_id: string;
}

/** 'InternalUsersRemoveUser' query type */
export interface IInternalUsersRemoveUserQuery {
  params: IInternalUsersRemoveUserParams;
  result: IInternalUsersRemoveUserResult;
}

const internalUsersRemoveUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]}],"statement":"                                                             \nDELETE FROM\n  internal.users\nWHERE\n  id = :userId!\n  AND status = 'CREATED'\nRETURNING\n  id AS user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * DELETE FROM
 *   internal.users
 * WHERE
 *   id = :userId!
 *   AND status = 'CREATED'
 * RETURNING
 *   id AS user_id
 * ```
 */
export const internalUsersRemoveUser = new PreparedQuery<IInternalUsersRemoveUserParams,IInternalUsersRemoveUserResult>(internalUsersRemoveUserIR);


