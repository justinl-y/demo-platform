/** Types generated for queries found in "src/repositories/users/types/set-users.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersSetUsers' parameters type */
export interface IUsersSetUsersParams {
  fullName: string;
  knownAs?: string | null | void;
  userId: string;
}

/** 'UsersSetUsers' return type */
export interface IUsersSetUsersResult {
  full_name: string;
  id: string;
  known_as: string | null;
}

/** 'UsersSetUsers' query type */
export interface IUsersSetUsersQuery {
  params: IUsersSetUsersParams;
  result: IUsersSetUsersResult;
}

const usersSetUsersIR: any = {"usedParamSet":{"fullName":true,"knownAs":true,"userId":true},"params":[{"name":"fullName","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":111}]},{"name":"knownAs","required":false,"transform":{"type":"scalar"},"locs":[{"a":128,"b":135}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":157}]}],"statement":"                                                             \nUPDATE\n  public.users\nSET\n  full_name = :fullName!\n  , known_as = :knownAs\nWHERE\n  id = :userId!\nRETURNING\n  id\n  , full_name\n  , known_as"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users
 * SET
 *   full_name = :fullName!
 *   , known_as = :knownAs
 * WHERE
 *   id = :userId!
 * RETURNING
 *   id
 *   , full_name
 *   , known_as
 * ```
 */
export const usersSetUsers = new PreparedQuery<IUsersSetUsersParams,IUsersSetUsersResult>(usersSetUsersIR);


