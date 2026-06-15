/** Types generated for queries found in "src/repositories/users/types/remove-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersRemoveUser' parameters type */
export interface IUsersRemoveUserParams {
  userId: string;
}

/** 'UsersRemoveUser' return type */
export interface IUsersRemoveUserResult {
  user_id: string;
}

/** 'UsersRemoveUser' query type */
export interface IUsersRemoveUserQuery {
  params: IUsersRemoveUserParams;
  result: IUsersRemoveUserResult;
}

const usersRemoveUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]}],"statement":"                                                             \nDELETE FROM\n  internal.users\nWHERE\n  id = :userId!\n  AND status = 'CREATED'\nRETURNING\n  id AS user_id"};

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
export const usersRemoveUser = new PreparedQuery<IUsersRemoveUserParams,IUsersRemoveUserResult>(usersRemoveUserIR);


