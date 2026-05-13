/** Types generated for queries found in "src/repositories/auth/types/set-user-refresh-hash-on-login.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserRefreshHashOnLogin' parameters type */
export interface IAuthSetUserRefreshHashOnLoginParams {
  hashedTokenRefresh: string;
  userId: string;
}

/** 'AuthSetUserRefreshHashOnLogin' return type */
export interface IAuthSetUserRefreshHashOnLoginResult {
  id: string;
}

/** 'AuthSetUserRefreshHashOnLogin' query type */
export interface IAuthSetUserRefreshHashOnLoginQuery {
  params: IAuthSetUserRefreshHashOnLoginParams;
  result: IAuthSetUserRefreshHashOnLoginResult;
}

const authSetUserRefreshHashOnLoginIR: any = {"usedParamSet":{"hashedTokenRefresh":true,"userId":true},"params":[{"name":"hashedTokenRefresh","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":130}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":187}]}],"statement":"                                                             \nUPDATE\n  public.users\nSET\n  token_refresh_hash = :hashedTokenRefresh!\n  , last_login = CURRENT_TIMESTAMP\nWHERE\n  id = :userId!\n  AND status = 'ACTIVE'\nRETURNING\n  id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users
 * SET
 *   token_refresh_hash = :hashedTokenRefresh!
 *   , last_login = CURRENT_TIMESTAMP
 * WHERE
 *   id = :userId!
 *   AND status = 'ACTIVE'
 * RETURNING
 *   id
 * ```
 */
export const authSetUserRefreshHashOnLogin = new PreparedQuery<IAuthSetUserRefreshHashOnLoginParams,IAuthSetUserRefreshHashOnLoginResult>(authSetUserRefreshHashOnLoginIR);


