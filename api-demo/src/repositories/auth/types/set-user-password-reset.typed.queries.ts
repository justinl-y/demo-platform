/** Types generated for queries found in "src/repositories/auth/types/set-user-password-reset.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserPasswordReset' parameters type */
export interface IAuthSetUserPasswordResetParams {
  passwordResetTokenExpiryMinutes: number;
  passwordResetTokenHash: string;
  userId: string;
}

/** 'AuthSetUserPasswordReset' return type */
export interface IAuthSetUserPasswordResetResult {
  user_id: string;
}

/** 'AuthSetUserPasswordReset' query type */
export interface IAuthSetUserPasswordResetQuery {
  params: IAuthSetUserPasswordResetParams;
  result: IAuthSetUserPasswordResetResult;
}

const authSetUserPasswordResetIR: any = {"usedParamSet":{"passwordResetTokenHash":true,"passwordResetTokenExpiryMinutes":true,"userId":true},"params":[{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":162}]},{"name":"passwordResetTokenExpiryMinutes","required":true,"transform":{"type":"scalar"},"locs":[{"a":231,"b":263}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":376,"b":383}]}],"statement":"                                                             \nUPDATE\n  public.users_authentication As ua\nSET\n  password_reset_token_hash = :passwordResetTokenHash!\n  , password_reset_token_expiry_at = NOW() + make_interval(mins => :passwordResetTokenExpiryMinutes!)\n  , password_reset_email_sent_at = NULL\nFROM\n  public.users AS u\nWHERE\n  u.id = ua.user_id\n  AND ua.user_id = :userId!\n  AND u.status = 'ACTIVE'\nRETURNING\n  ua.user_id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users_authentication As ua
 * SET
 *   password_reset_token_hash = :passwordResetTokenHash!
 *   , password_reset_token_expiry_at = NOW() + make_interval(mins => :passwordResetTokenExpiryMinutes!)
 *   , password_reset_email_sent_at = NULL
 * FROM
 *   public.users AS u
 * WHERE
 *   u.id = ua.user_id
 *   AND ua.user_id = :userId!
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   ua.user_id
 * ```
 */
export const authSetUserPasswordReset = new PreparedQuery<IAuthSetUserPasswordResetParams,IAuthSetUserPasswordResetResult>(authSetUserPasswordResetIR);


