/** Types generated for queries found in "src/repositories/internal-users/types/set-user-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InternalUsersSetUserEmail' parameters type */
export interface IInternalUsersSetUserEmailParams {
  newEmail: string;
  userId: string;
}

/** 'InternalUsersSetUserEmail' return type */
export interface IInternalUsersSetUserEmailResult {
  email: string;
  user_id: string;
}

/** 'InternalUsersSetUserEmail' query type */
export interface IInternalUsersSetUserEmailQuery {
  params: IInternalUsersSetUserEmailParams;
  result: IInternalUsersSetUserEmailResult;
}

const internalUsersSetUserEmailIR: any = {"usedParamSet":{"newEmail":true,"userId":true},"params":[{"name":"newEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":109}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]}],"statement":"                                                             \nUPDATE\n  internal.users\nSET\n  email = :newEmail!\nWHERE\n  id = :userId!\nRETURNING\n  id AS user_id\n  , email"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users
 * SET
 *   email = :newEmail!
 * WHERE
 *   id = :userId!
 * RETURNING
 *   id AS user_id
 *   , email
 * ```
 */
export const internalUsersSetUserEmail = new PreparedQuery<IInternalUsersSetUserEmailParams,IInternalUsersSetUserEmailResult>(internalUsersSetUserEmailIR);


