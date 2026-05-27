/** Types generated for queries found in "src/repositories/users/types/set-user-invite-email-sent.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersSetUserInviteEmailSent' parameters type */
export interface IUsersSetUserInviteEmailSentParams {
  inviteTokenHash: string;
  userId: string;
}

/** 'UsersSetUserInviteEmailSent' return type */
export interface IUsersSetUserInviteEmailSentResult {
  user_id: string;
}

/** 'UsersSetUserInviteEmailSent' query type */
export interface IUsersSetUserInviteEmailSentQuery {
  params: IUsersSetUserInviteEmailSentParams;
  result: IUsersSetUserInviteEmailSentResult;
}

const usersSetUserInviteEmailSentIR: any = {"usedParamSet":{"userId":true,"inviteTokenHash":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":152,"b":159}]},{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":203}]}],"statement":"                                                             \nUPDATE\n  public.users_authentication\nSET\n  invite_email_sent_at = now()\nWHERE\n  user_id = :userId!\n  AND invite_token_hash = :inviteTokenHash!\nRETURNING\n  user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users_authentication
 * SET
 *   invite_email_sent_at = now()
 * WHERE
 *   user_id = :userId!
 *   AND invite_token_hash = :inviteTokenHash!
 * RETURNING
 *   user_id
 * ```
 */
export const usersSetUserInviteEmailSent = new PreparedQuery<IUsersSetUserInviteEmailSentParams,IUsersSetUserInviteEmailSentResult>(usersSetUserInviteEmailSentIR);


