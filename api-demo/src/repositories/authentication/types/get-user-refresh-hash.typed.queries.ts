/** Types generated for queries found in "src/repositories/authentication/types/get-user-refresh-hash.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthenticationGetUserRefreshHash' parameters type */
export interface IAuthenticationGetUserRefreshHashParams {
  userId: string;
}

/** 'AuthenticationGetUserRefreshHash' return type */
export interface IAuthenticationGetUserRefreshHashResult {
  id: string;
  refresh_token_hash: string;
}

/** 'AuthenticationGetUserRefreshHash' query type */
export interface IAuthenticationGetUserRefreshHashQuery {
  params: IAuthenticationGetUserRefreshHashParams;
  result: IAuthenticationGetUserRefreshHashResult;
}

const authenticationGetUserRefreshHashIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":211,"b":218}]}],"statement":"                                                             \nSELECT\n  u.id\n  , a.refresh_token_hash\nFROM\n  internal.users AS u\n  INNER JOIN internal.users_authentication AS a ON a.user_id = u.id\nWHERE\n  u.id = :userId!\n  AND a.refresh_token_hash IS NOT NULL\n  AND u.status = 'ACTIVE'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 *   , a.refresh_token_hash
 * FROM
 *   internal.users AS u
 *   INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
 * WHERE
 *   u.id = :userId!
 *   AND a.refresh_token_hash IS NOT NULL
 *   AND u.status = 'ACTIVE'
 * ```
 */
export const authenticationGetUserRefreshHash = new PreparedQuery<IAuthenticationGetUserRefreshHashParams,IAuthenticationGetUserRefreshHashResult>(authenticationGetUserRefreshHashIR);


