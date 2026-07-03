/** Types generated for queries found in "src/repositories/internal-users/types/set-user-invite-email-sent.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InternalUsersSetUserInviteEmailSent' parameters type */
export interface IInternalUsersSetUserInviteEmailSentParams {
  inviteTokenHash: string;
  userId: string;
}

/** 'InternalUsersSetUserInviteEmailSent' return type */
export interface IInternalUsersSetUserInviteEmailSentResult {
  user_id: string;
}

/** 'InternalUsersSetUserInviteEmailSent' query type */
export interface IInternalUsersSetUserInviteEmailSentQuery {
  params: IInternalUsersSetUserInviteEmailSentParams;
  result: IInternalUsersSetUserInviteEmailSentResult;
}

const internalUsersSetUserInviteEmailSentIR: any = {"usedParamSet":{"userId":true,"inviteTokenHash":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":161}]},{"name":"inviteTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":189,"b":205}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication\nSET\n  invite_email_sent_at = now()\nWHERE\n  user_id = :userId!\n  AND invite_token_hash = :inviteTokenHash!\nRETURNING\n  user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication
 * SET
 *   invite_email_sent_at = now()
 * WHERE
 *   user_id = :userId!
 *   AND invite_token_hash = :inviteTokenHash!
 * RETURNING
 *   user_id
 * ```
 */
export const internalUsersSetUserInviteEmailSent = new PreparedQuery<IInternalUsersSetUserInviteEmailSentParams,IInternalUsersSetUserInviteEmailSentResult>(internalUsersSetUserInviteEmailSentIR);


