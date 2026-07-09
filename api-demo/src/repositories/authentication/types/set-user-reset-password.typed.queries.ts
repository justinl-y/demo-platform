/** Types generated for queries found in "src/repositories/authentication/types/set-user-reset-password.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthenticationSetUserResetPassword' parameters type */
export interface IAuthenticationSetUserResetPasswordParams {
  hashedNewPassword: string;
  passwordResetTokenHash: string;
}

/** 'AuthenticationSetUserResetPassword' return type */
export interface IAuthenticationSetUserResetPasswordResult {
  user_id: string;
}

/** 'AuthenticationSetUserResetPassword' query type */
export interface IAuthenticationSetUserResetPasswordQuery {
  params: IAuthenticationSetUserResetPasswordParams;
  result: IAuthenticationSetUserResetPasswordResult;
}

const authenticationSetUserResetPasswordIR: any = {"usedParamSet":{"hashedNewPassword":true,"passwordResetTokenHash":true},"params":[{"name":"hashedNewPassword","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":147}]},{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":388,"b":411}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication AS ua\nSET\n  password_hash = :hashedNewPassword!\n  , password_reset_token_hash = NULL\n  , password_reset_token_expiry_at = NULL\n  , password_reset_email_sent_at = NULL\n  , refresh_token_hash = NULL\nFROM\n  internal.users AS u\nWHERE\n  u.id = ua.user_id\n  AND ua.password_reset_token_hash = :passwordResetTokenHash!\n  AND ua.password_reset_token_expiry_at > NOW()\n  AND u.status = 'ACTIVE'\nRETURNING\n  ua.user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication AS ua
 * SET
 *   password_hash = :hashedNewPassword!
 *   , password_reset_token_hash = NULL
 *   , password_reset_token_expiry_at = NULL
 *   , password_reset_email_sent_at = NULL
 *   , refresh_token_hash = NULL
 * FROM
 *   internal.users AS u
 * WHERE
 *   u.id = ua.user_id
 *   AND ua.password_reset_token_hash = :passwordResetTokenHash!
 *   AND ua.password_reset_token_expiry_at > NOW()
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   ua.user_id
 * ```
 */
export const authenticationSetUserResetPassword = new PreparedQuery<IAuthenticationSetUserResetPasswordParams,IAuthenticationSetUserResetPasswordResult>(authenticationSetUserResetPasswordIR);


