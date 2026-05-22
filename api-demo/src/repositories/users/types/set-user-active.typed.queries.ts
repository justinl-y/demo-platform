/** Types generated for queries found in "src/repositories/users/types/set-user-active.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'UsersSetUserActive' parameters type */
export interface IUsersSetUserActiveParams {
  inviteTokenHash: string;
  passwordHash: string;
}

/** 'UsersSetUserActive' return type */
export interface IUsersSetUserActiveResult {
  status: user_status;
  user_id: string;
}

/** 'UsersSetUserActive' query type */
export interface IUsersSetUserActiveQuery {
  params: IUsersSetUserActiveParams;
  result: IUsersSetUserActiveResult;
}

const usersSetUserActiveIR: any = {"usedParamSet":{"inviteTokenHash":true,"passwordHash":true},"params":[{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":252,"b":268}]},{"name":"passwordHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":443,"b":456}]}],"statement":"                                                             \nWITH t_activated AS (\n  UPDATE\n    public.users AS u\n  SET\n    activated_at = NOW()\n  FROM\n    public.users_authentication AS ua\n  WHERE\n    u.id = ua.user_id\n    AND ua.invite_token_hash = :inviteTokenHash!\n    AND ua.invite_token_expiry_at > NOW()\n    AND u.status = 'INVITED'\n  RETURNING\n    u.id\n    , u.status\n)\nUPDATE\n  public.users_authentication AS a\nSET\n  password_hash = :passwordHash!\n  , invite_token_hash = NULL\n  , invite_token_expiry_at = NULL\nFROM\n  t_activated\nWHERE\n  a.user_id = t_activated.id\nRETURNING\n  a.user_id\n  , t_activated.status AS status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_activated AS (
 *   UPDATE
 *     public.users AS u
 *   SET
 *     activated_at = NOW()
 *   FROM
 *     public.users_authentication AS ua
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
 *   public.users_authentication AS a
 * SET
 *   password_hash = :passwordHash!
 *   , invite_token_hash = NULL
 *   , invite_token_expiry_at = NULL
 * FROM
 *   t_activated
 * WHERE
 *   a.user_id = t_activated.id
 * RETURNING
 *   a.user_id
 *   , t_activated.status AS status
 * ```
 */
export const usersSetUserActive = new PreparedQuery<IUsersSetUserActiveParams,IUsersSetUserActiveResult>(usersSetUserActiveIR);


