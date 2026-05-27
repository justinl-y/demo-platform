/** Types generated for queries found in "src/repositories/users/types/cancel-user-invite.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'UsersCancelUserInvite' parameters type */
export interface IUsersCancelUserInviteParams {
  userId: string;
}

/** 'UsersCancelUserInvite' return type */
export interface IUsersCancelUserInviteResult {
  status: user_status;
  user_id: string;
}

/** 'UsersCancelUserInvite' query type */
export interface IUsersCancelUserInviteQuery {
  params: IUsersCancelUserInviteParams;
  result: IUsersCancelUserInviteResult;
}

const usersCancelUserInviteIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":169}]}],"statement":"                                                             \nWITH t_cancelled AS (\n  UPDATE\n    public.users AS u\n  SET\n    invited_at = NULL\n  WHERE\n    u.id = :userId!\n    AND u.status = 'INVITED'\n  RETURNING\n    u.id\n    , u.status\n)\nUPDATE\n  public.users_authentication AS a\nSET\n  invite_token_hash = NULL\n  , invite_token_expiry_at = NULL\n  , invite_email_sent_at = NULL\nFROM\n  t_cancelled\nWHERE\n  a.user_id = t_cancelled.id\nRETURNING\n  a.user_id\n  , t_cancelled.status AS status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_cancelled AS (
 *   UPDATE
 *     public.users AS u
 *   SET
 *     invited_at = NULL
 *   WHERE
 *     u.id = :userId!
 *     AND u.status = 'INVITED'
 *   RETURNING
 *     u.id
 *     , u.status
 * )
 * UPDATE
 *   public.users_authentication AS a
 * SET
 *   invite_token_hash = NULL
 *   , invite_token_expiry_at = NULL
 *   , invite_email_sent_at = NULL
 * FROM
 *   t_cancelled
 * WHERE
 *   a.user_id = t_cancelled.id
 * RETURNING
 *   a.user_id
 *   , t_cancelled.status AS status
 * ```
 */
export const usersCancelUserInvite = new PreparedQuery<IUsersCancelUserInviteParams,IUsersCancelUserInviteResult>(usersCancelUserInviteIR);


