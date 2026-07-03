/** Types generated for queries found in "src/repositories/internal-users/types/set-user-deactivated.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'InternalUsersSetUserDeactivated' parameters type */
export interface IInternalUsersSetUserDeactivatedParams {
  newPasswordHash: string;
  userId: string;
}

/** 'InternalUsersSetUserDeactivated' return type */
export interface IInternalUsersSetUserDeactivatedResult {
  status: user_status;
  user_id: string;
}

/** 'InternalUsersSetUserDeactivated' query type */
export interface IInternalUsersSetUserDeactivatedQuery {
  params: IInternalUsersSetUserDeactivatedParams;
  result: IInternalUsersSetUserDeactivatedResult;
}

const internalUsersSetUserDeactivatedIR: any = {"usedParamSet":{"userId":true,"newPasswordHash":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":169}]},{"name":"newPasswordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":297,"b":313}]}],"statement":"                                                             \nWITH deactivated AS (\n  UPDATE\n    internal.users\n  SET\n    deactivated_at = NOW()\n  WHERE\n    id = :userId!\n    AND status = 'ACTIVE'\n  RETURNING\n    id\n    , status\n)\nUPDATE\n  internal.users_authentication AS a\nSET\n  password_hash = :newPasswordHash!\n  , refresh_token_hash = NULL\nFROM\n  deactivated AS d\nWHERE\n  a.user_id = d.id\nRETURNING\n  a.user_id\n  , d.status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH deactivated AS (
 *   UPDATE
 *     internal.users
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
 *   internal.users_authentication AS a
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
export const internalUsersSetUserDeactivated = new PreparedQuery<IInternalUsersSetUserDeactivatedParams,IInternalUsersSetUserDeactivatedResult>(internalUsersSetUserDeactivatedIR);


