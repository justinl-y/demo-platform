/** Types generated for queries found in "src/repositories/users/types/set-user-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersSetUserEmail' parameters type */
export interface IUsersSetUserEmailParams {
  newEmail: string;
  userId: string;
}

/** 'UsersSetUserEmail' return type */
export interface IUsersSetUserEmailResult {
  email: string;
  user_id: string;
}

/** 'UsersSetUserEmail' query type */
export interface IUsersSetUserEmailQuery {
  params: IUsersSetUserEmailParams;
  result: IUsersSetUserEmailResult;
}

const usersSetUserEmailIR: any = {"usedParamSet":{"newEmail":true,"userId":true},"params":[{"name":"newEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":109}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]}],"statement":"                                                             \nUPDATE\n  internal.users\nSET\n  email = :newEmail!\nWHERE\n  id = :userId!\nRETURNING\n  id AS user_id\n  , email"};

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
export const usersSetUserEmail = new PreparedQuery<IUsersSetUserEmailParams,IUsersSetUserEmailResult>(usersSetUserEmailIR);


