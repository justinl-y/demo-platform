/** Types generated for queries found in "src/repositories/users/types/set-user-deactivated.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'UsersSetUserDeactivated' parameters type */
export interface IUsersSetUserDeactivatedParams {
  newPasswordHash: string;
  userId: string;
}

/** 'UsersSetUserDeactivated' return type */
export interface IUsersSetUserDeactivatedResult {
  status: user_status;
  user_id: string;
}

/** 'UsersSetUserDeactivated' query type */
export interface IUsersSetUserDeactivatedQuery {
  params: IUsersSetUserDeactivatedParams;
  result: IUsersSetUserDeactivatedResult;
}

const usersSetUserDeactivatedIR: any = {"usedParamSet":{"userId":true,"newPasswordHash":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":160,"b":167}]},{"name":"newPasswordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":293,"b":309}]}],"statement":"                                                             \nWITH deactivated AS (\n  UPDATE\n    public.users\n  SET\n    deactivated_at = NOW()\n  WHERE\n    id = :userId!\n    AND status = 'ACTIVE'\n  RETURNING\n    id\n    , status\n)\nUPDATE\n  public.users_authentication AS a\nSET\n  password_hash = :newPasswordHash!\n  , refresh_token_hash = NULL\nFROM\n  deactivated AS d\nWHERE\n  a.user_id = d.id\nRETURNING\n  a.user_id\n  , d.status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH deactivated AS (
 *   UPDATE
 *     public.users
 *   SET
 *     deactivated_at = NOW()
 *   WHERE
 *     id = :userId!
 *     AND status = 'ACTIVE'
 *   RETURNING
 *     id
 *     , status
 * )
 * UPDATE
 *   public.users_authentication AS a
 * SET
 *   password_hash = :newPasswordHash!
 *   , refresh_token_hash = NULL
 * FROM
 *   deactivated AS d
 * WHERE
 *   a.user_id = d.id
 * RETURNING
 *   a.user_id
 *   , d.status
 * ```
 */
export const usersSetUserDeactivated = new PreparedQuery<IUsersSetUserDeactivatedParams,IUsersSetUserDeactivatedResult>(usersSetUserDeactivatedIR);


