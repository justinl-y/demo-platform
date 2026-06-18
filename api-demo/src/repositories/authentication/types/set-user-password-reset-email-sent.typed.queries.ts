/** Types generated for queries found in "src/repositories/authentication/types/set-user-password-reset-email-sent.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthenticationSetUserPasswordResetEmailSent' parameters type */
export interface IAuthenticationSetUserPasswordResetEmailSentParams {
  passwordResetTokenHash: string;
  userId: string;
}

/** 'AuthenticationSetUserPasswordResetEmailSent' return type */
export interface IAuthenticationSetUserPasswordResetEmailSentResult {
  user_id: string;
}

/** 'AuthenticationSetUserPasswordResetEmailSent' query type */
export interface IAuthenticationSetUserPasswordResetEmailSentQuery {
  params: IAuthenticationSetUserPasswordResetEmailSentParams;
  result: IAuthenticationSetUserPasswordResetEmailSentResult;
}

const authenticationSetUserPasswordResetEmailSentIR: any = {"usedParamSet":{"userId":true,"passwordResetTokenHash":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":169}]},{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":205,"b":228}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication\nSET\n  password_reset_email_sent_at = now()\nWHERE\n  user_id = :userId!\n  AND password_reset_token_hash = :passwordResetTokenHash!\nRETURNING\n  user_id"};

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
export const authenticationSetUserPasswordResetEmailSent = new PreparedQuery<IAuthenticationSetUserPasswordResetEmailSentParams,IAuthenticationSetUserPasswordResetEmailSentResult>(authenticationSetUserPasswordResetEmailSentIR);


