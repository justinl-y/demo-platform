/** Types generated for queries found in "src/repositories/users/types/set-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersSetUser' parameters type */
export interface IUsersSetUserParams {
  fullName: string;
  knownAs?: string | null | void;
  userId: string;
}

/** 'UsersSetUser' return type */
export interface IUsersSetUserResult {
  full_name: string;
  known_as: string | null;
  user_id: string;
}

/** 'UsersSetUser' query type */
export interface IUsersSetUserQuery {
  params: IUsersSetUserParams;
  result: IUsersSetUserResult;
}

const usersSetUserIR: any = {"usedParamSet":{"fullName":true,"knownAs":true,"userId":true},"params":[{"name":"fullName","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":113}]},{"name":"knownAs","required":false,"transform":{"type":"scalar"},"locs":[{"a":130,"b":137}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":152,"b":159}]}],"statement":"                                                             \nUPDATE\n  internal.users\nSET\n  full_name = :fullName!\n  , known_as = :knownAs\nWHERE\n  id = :userId!\nRETURNING\n  id AS user_id\n  , full_name\n  , known_as"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users
 * SET
 *   full_name = :fullName!
 *   , known_as = :knownAs
 * WHERE
 *   id = :userId!
 * RETURNING
 *   id AS user_id
 *   , full_name
 *   , known_as
 * ```
 */
export const usersSetUser = new PreparedQuery<IUsersSetUserParams,IUsersSetUserResult>(usersSetUserIR);


