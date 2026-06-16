/** Types generated for queries found in "src/repositories/users/types/set-user-invited.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'UsersSetUserInvited' parameters type */
export interface IUsersSetUserInvitedParams {
  inviteTokenExpiryDays: number;
  inviteTokenHash: string;
  userId: string;
}

/** 'UsersSetUserInvited' return type */
export interface IUsersSetUserInvitedResult {
  email: string;
  status: user_status;
  user_id: string;
}

/** 'UsersSetUserInvited' query type */
export interface IUsersSetUserInvitedQuery {
  params: IUsersSetUserInvitedParams;
  result: IUsersSetUserInvitedResult;
}

const usersSetUserInvitedIR: any = {"usedParamSet":{"userId":true,"inviteTokenHash":true,"inviteTokenExpiryDays":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":210,"b":217}]},{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":391,"b":407}]},{"name":"inviteTokenExpiryDays","required":true,"transform":{"type":"scalar"},"locs":[{"a":468,"b":490}]}],"statement":"                                                             \nWITH t_invited AS (\n  UPDATE\n    internal.users\n  SET\n    invited_at = NOW()\n    , deactivated_at = NULL\n    , activated_at = NULL\n  WHERE\n    id = :userId!\n    AND status = ANY('{CREATED, INVITED, DEACTIVATED}')\n  RETURNING\n    id\n    , email\n    , status\n)\nUPDATE\n  internal.users_authentication AS a\nSET\n  invite_token_hash = :inviteTokenHash!\n  , invite_token_expiry_at = NOW() + make_interval(days => :inviteTokenExpiryDays!)\n  , invite_email_sent_at = NULL\nFROM\n  t_invited AS i\nWHERE\n  a.user_id = i.id\nRETURNING\n  i.id AS user_id\n  , i.email\n  , i.status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_invited AS (
 *   UPDATE
 *     internal.users
 *   SET
 *     invited_at = NOW()
 *     , deactivated_at = NULL
 *     , activated_at = NULL
 *   WHERE
 *     id = :userId!
 *     AND status = ANY('{CREATED, INVITED, DEACTIVATED}')
 *   RETURNING
 *     id
 *     , email
 *     , status
 * )
 * UPDATE
 *   internal.users_authentication AS a
 * SET
 *   invite_token_hash = :inviteTokenHash!
 *   , invite_token_expiry_at = NOW() + make_interval(days => :inviteTokenExpiryDays!)
 *   , invite_email_sent_at = NULL
 * FROM
 *   t_invited AS i
 * WHERE
 *   a.user_id = i.id
 * RETURNING
 *   i.id AS user_id
 *   , i.email
 *   , i.status
 * ```
 */
export const usersSetUserInvited = new PreparedQuery<IUsersSetUserInvitedParams,IUsersSetUserInvitedResult>(usersSetUserInvitedIR);


