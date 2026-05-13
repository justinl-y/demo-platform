/** Types generated for queries found in "src/repositories/users/types/set-user-deactivated.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersSetUserDeactivated' parameters type */
export interface IUsersSetUserDeactivatedParams {
  newPasswordHash?: string | null | void;
  userId?: string | null | void;
}

/** 'UsersSetUserDeactivated' return type */
export interface IUsersSetUserDeactivatedResult {
  id: string;
}

/** 'UsersSetUserDeactivated' query type */
export interface IUsersSetUserDeactivatedQuery {
  params: IUsersSetUserDeactivatedParams;
  result: IUsersSetUserDeactivatedResult;
}

const usersSetUserDeactivatedIR: any = {"usedParamSet":{"newPasswordHash":true,"userId":true},"params":[{"name":"newPasswordHash","required":false,"transform":{"type":"scalar"},"locs":[{"a":133,"b":148}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":163,"b":169}]}],"statement":"                                                             \nUPDATE\n  public.users\nSET\n  deactivated_at = NOW()\n  , password_hash = :newPasswordHash\nWHERE\n  id = :userId\n  AND status = 'ACTIVE'\nRETURNING\n  id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users
 * SET
 *   deactivated_at = NOW()
 *   , password_hash = :newPasswordHash
 * WHERE
 *   id = :userId
 *   AND status = 'ACTIVE'
 * RETURNING
 *   id
 * ```
 */
export const usersSetUserDeactivated = new PreparedQuery<IUsersSetUserDeactivatedParams,IUsersSetUserDeactivatedResult>(usersSetUserDeactivatedIR);


