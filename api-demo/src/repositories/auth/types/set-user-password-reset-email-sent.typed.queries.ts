/** Types generated for queries found in "src/repositories/auth/types/set-user-password-reset-email-sent.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserPasswordResetEmailSent' parameters type */
export interface IAuthSetUserPasswordResetEmailSentParams {
  passwordResetTokenHash: string;
  userId: string;
}

/** 'AuthSetUserPasswordResetEmailSent' return type */
export interface IAuthSetUserPasswordResetEmailSentResult {
  user_id: string;
}

/** 'AuthSetUserPasswordResetEmailSent' query type */
export interface IAuthSetUserPasswordResetEmailSentQuery {
  params: IAuthSetUserPasswordResetEmailSentParams;
  result: IAuthSetUserPasswordResetEmailSentResult;
}

const authSetUserPasswordResetEmailSentIR: any = {"usedParamSet":{"userId":true,"passwordResetTokenHash":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":169}]},{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":205,"b":228}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication\nSET\n  password_reset_email_sent_at = now()\nWHERE\n  user_id = :userId!\n  AND password_reset_token_hash = :passwordResetTokenHash!\nRETURNING\n  user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication
 * SET
 *   password_reset_email_sent_at = now()
 * WHERE
 *   user_id = :userId!
 *   AND password_reset_token_hash = :passwordResetTokenHash!
 * RETURNING
 *   user_id
 * ```
 */
export const authSetUserPasswordResetEmailSent = new PreparedQuery<IAuthSetUserPasswordResetEmailSentParams,IAuthSetUserPasswordResetEmailSentResult>(authSetUserPasswordResetEmailSentIR);


