/** Types generated for queries found in "src/repositories/authentication/types/set-user-refresh-hash-on-refresh.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthenticationSetUserRefreshHashOnRefresh' parameters type */
export interface IAuthenticationSetUserRefreshHashOnRefreshParams {
  newRefreshTokenHash: string;
  userId: string;
}

/** 'AuthenticationSetUserRefreshHashOnRefresh' return type */
export interface IAuthenticationSetUserRefreshHashOnRefreshResult {
  id: string;
}

/** 'AuthenticationSetUserRefreshHashOnRefresh' query type */
export interface IAuthenticationSetUserRefreshHashOnRefreshQuery {
  params: IAuthenticationSetUserRefreshHashOnRefreshParams;
  result: IAuthenticationSetUserRefreshHashOnRefreshResult;
}

const authenticationSetUserRefreshHashOnRefreshIR: any = {"usedParamSet":{"newRefreshTokenHash":true,"userId":true},"params":[{"name":"newRefreshTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":133,"b":153}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":202,"b":209}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication AS a\nSET\n  refresh_token_hash = :newRefreshTokenHash!\nFROM\n  internal.users AS u\nWHERE\n  a.user_id = :userId!\n  AND u.id = a.user_id\n  AND u.status = 'ACTIVE'\nRETURNING\n  a.user_id AS id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication AS a
 * SET
 *   refresh_token_hash = :newRefreshTokenHash!
 * FROM
 *   internal.users AS u
 * WHERE
 *   a.user_id = :userId!
 *   AND u.id = a.user_id
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   a.user_id AS id
 * ```
 */
export const authenticationSetUserRefreshHashOnRefresh = new PreparedQuery<IAuthenticationSetUserRefreshHashOnRefreshParams,IAuthenticationSetUserRefreshHashOnRefreshResult>(authenticationSetUserRefreshHashOnRefreshIR);


