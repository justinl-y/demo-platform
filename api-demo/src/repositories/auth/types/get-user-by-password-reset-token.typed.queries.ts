/** Types generated for queries found in "src/repositories/auth/types/get-user-by-password-reset-token.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthGetUserByPasswordResetToken' parameters type */
export interface IAuthGetUserByPasswordResetTokenParams {
  passwordResetTokenHash: string;
}

/** 'AuthGetUserByPasswordResetToken' return type */
export interface IAuthGetUserByPasswordResetTokenResult {
  user_id: string;
}

/** 'AuthGetUserByPasswordResetToken' query type */
export interface IAuthGetUserByPasswordResetTokenQuery {
  params: IAuthGetUserByPasswordResetTokenParams;
  result: IAuthGetUserByPasswordResetTokenResult;
}

const authGetUserByPasswordResetTokenIR: any = {"usedParamSet":{"passwordResetTokenHash":true},"params":[{"name":"passwordResetTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":218,"b":241}]}],"statement":"                                                             \nSELECT\n  ua.user_id\nFROM\n  internal.users_authentication AS ua\n  INNER JOIN internal.users AS u ON u.id = ua.user_id\nWHERE\n  ua.password_reset_token_hash = :passwordResetTokenHash!\n  AND ua.password_reset_token_expiry_at > NOW()\n  AND u.status = 'ACTIVE'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   ua.user_id
 * FROM
 *   internal.users_authentication AS ua
 *   INNER JOIN internal.users AS u ON u.id = ua.user_id
 * WHERE
 *   ua.password_reset_token_hash = :passwordResetTokenHash!
 *   AND ua.password_reset_token_expiry_at > NOW()
 *   AND u.status = 'ACTIVE'
 * ```
 */
export const authGetUserByPasswordResetToken = new PreparedQuery<IAuthGetUserByPasswordResetTokenParams,IAuthGetUserByPasswordResetTokenResult>(authGetUserByPasswordResetTokenIR);


