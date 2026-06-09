/** Types generated for queries found in "src/repositories/auth/types/set-user-reset-password.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserResetPassword' parameters type */
export interface IAuthSetUserResetPasswordParams {
  hashedNewPassword: string;
  passwordResetTokenHash: string;
}

/** 'AuthSetUserResetPassword' return type */
export interface IAuthSetUserResetPasswordResult {
  user_id: string;
}

/** 'AuthSetUserResetPassword' query type */
export interface IAuthSetUserResetPasswordQuery {
  params: IAuthSetUserResetPasswordParams;
  result: IAuthSetUserResetPasswordResult;
}

const authSetUserResetPasswordIR: any = {"usedParamSet":{"hashedNewPassword":true,"passwordResetTokenHash":true},"params":[{"name":"hashedNewPassword","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":145}]},{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":344,"b":367}]}],"statement":"                                                             \nUPDATE\n  public.users_authentication AS ua\nSET\n  password_hash = :hashedNewPassword!\n  , password_reset_token_hash = NULL\n  , password_reset_token_expiry_at = NULL\n  , refresh_token_hash = NULL\nFROM\n  public.users AS u\nWHERE\n  u.id = ua.user_id\n  AND ua.password_reset_token_hash = :passwordResetTokenHash!\n  AND ua.password_reset_token_expiry_at > NOW()\n  AND u.status = 'ACTIVE'\nRETURNING\n  ua.user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users_authentication AS ua
 * SET
 *   password_hash = :hashedNewPassword!
 *   , password_reset_token_hash = NULL
 *   , password_reset_token_expiry_at = NULL
 *   , refresh_token_hash = NULL
 * FROM
 *   public.users AS u
 * WHERE
 *   u.id = ua.user_id
 *   AND ua.password_reset_token_hash = :passwordResetTokenHash!
 *   AND ua.password_reset_token_expiry_at > NOW()
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   ua.user_id
 * ```
 */
export const authSetUserResetPassword = new PreparedQuery<IAuthSetUserResetPasswordParams,IAuthSetUserResetPasswordResult>(authSetUserResetPasswordIR);


