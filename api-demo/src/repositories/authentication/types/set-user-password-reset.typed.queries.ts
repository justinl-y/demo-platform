/** Types generated for queries found in "src/repositories/authentication/types/set-user-password-reset.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthenticationSetUserPasswordReset' parameters type */
export interface IAuthenticationSetUserPasswordResetParams {
  passwordResetTokenExpiryMinutes: number;
  passwordResetTokenHash: string;
  userId: string;
}

/** 'AuthenticationSetUserPasswordReset' return type */
export interface IAuthenticationSetUserPasswordResetResult {
  user_id: string;
}

/** 'AuthenticationSetUserPasswordReset' query type */
export interface IAuthenticationSetUserPasswordResetQuery {
  params: IAuthenticationSetUserPasswordResetParams;
  result: IAuthenticationSetUserPasswordResetResult;
}

const authenticationSetUserPasswordResetIR: any = {"usedParamSet":{"passwordResetTokenHash":true,"passwordResetTokenExpiryMinutes":true,"userId":true},"params":[{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":141,"b":164}]},{"name":"passwordResetTokenExpiryMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":233,"b":265}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":380,"b":387}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication As ua\nSET\n  password_reset_token_hash = :passwordResetTokenHash!\n  , password_reset_token_expiry_at = NOW() + make_interval(mins => :passwordResetTokenExpiryMinutes!)\n  , password_reset_email_sent_at = NULL\nFROM\n  internal.users AS u\nWHERE\n  u.id = ua.user_id\n  AND ua.user_id = :userId!\n  AND u.status = 'ACTIVE'\nRETURNING\n  ua.user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication As ua
 * SET
 *   password_reset_token_hash = :passwordResetTokenHash!
 *   , password_reset_token_expiry_at = NOW() + make_interval(mins => :passwordResetTokenExpiryMinutes!)
 *   , password_reset_email_sent_at = NULL
 * FROM
 *   internal.users AS u
 * WHERE
 *   u.id = ua.user_id
 *   AND ua.user_id = :userId!
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   ua.user_id
 * ```
 */
export const authenticationSetUserPasswordReset = new PreparedQuery<IAuthenticationSetUserPasswordResetParams,IAuthenticationSetUserPasswordResetResult>(authenticationSetUserPasswordResetIR);


