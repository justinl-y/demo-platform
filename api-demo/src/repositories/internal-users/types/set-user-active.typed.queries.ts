/** Types generated for queries found in "src/repositories/internal-users/types/set-user-active.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'InternalUsersSetUserActive' parameters type */
export interface IInternalUsersSetUserActiveParams {
  inviteTokenHash: string;
  passwordHash: string;
}

/** 'InternalUsersSetUserActive' return type */
export interface IInternalUsersSetUserActiveResult {
  status: user_status;
  user_id: string;
}

/** 'InternalUsersSetUserActive' query type */
export interface IInternalUsersSetUserActiveQuery {
  params: IInternalUsersSetUserActiveParams;
  result: IInternalUsersSetUserActiveResult;
}

const internalUsersSetUserActiveIR: any = {"usedParamSet":{"inviteTokenHash":true,"passwordHash":true},"params":[{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":256,"b":272}]},{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":449,"b":462}]}],"statement":"                                                             \nWITH t_activated AS (\n  UPDATE\n    internal.users AS u\n  SET\n    activated_at = NOW()\n  FROM\n    internal.users_authentication AS ua\n  WHERE\n    u.id = ua.user_id\n    AND ua.invite_token_hash = :inviteTokenHash!\n    AND ua.invite_token_expiry_at > NOW()\n    AND u.status = 'INVITED'\n  RETURNING\n    u.id\n    , u.status\n)\nUPDATE\n  internal.users_authentication AS a\nSET\n  password_hash = :passwordHash!\n  , invite_token_hash = NULL\n  , invite_token_expiry_at = NULL\n  , invite_email_sent_at = NULL\nFROM\n  t_activated\nWHERE\n  a.user_id = t_activated.id\nRETURNING\n  a.user_id\n  , t_activated.status AS status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_activated AS (
 *   UPDATE
 *     internal.users AS u
 *   SET
 *     activated_at = NOW()
 *   FROM
 *     internal.users_authentication AS ua
 *   WHERE
 *     u.id = ua.user_id
 *     AND ua.invite_token_hash = :inviteTokenHash!
 *     AND ua.invite_token_expiry_at > NOW()
 *     AND u.status = 'INVITED'
 *   RETURNING
 *     u.id
 *     , u.status
 * )
 * UPDATE
 *   internal.users_authentication AS a
 * SET
 *   password_hash = :passwordHash!
 *   , invite_token_hash = NULL
 *   , invite_token_expiry_at = NULL
 *   , invite_email_sent_at = NULL
 * FROM
 *   t_activated
 * WHERE
 *   a.user_id = t_activated.id
 * RETURNING
 *   a.user_id
 *   , t_activated.status AS status
 * ```
 */
export const internalUsersSetUserActive = new PreparedQuery<IInternalUsersSetUserActiveParams,IInternalUsersSetUserActiveResult>(internalUsersSetUserActiveIR);


