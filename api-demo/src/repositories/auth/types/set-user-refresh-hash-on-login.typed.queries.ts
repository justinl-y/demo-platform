/** Types generated for queries found in "src/repositories/auth/types/set-user-refresh-hash-on-login.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserRefreshHashOnLogin' parameters type */
export interface IAuthSetUserRefreshHashOnLoginParams {
  hashedRefreshToken: string;
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

const authSetUserRefreshHashOnLoginIR: any = {"usedParamSet":{"hashedRefreshToken":true,"userId":true},"params":[{"name":"hashedRefreshToken","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":150}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":232,"b":239}]}],"statement":"                                                             \nUPDATE\n  public.users_authentication AS a\nSET\n  refresh_token_hash = :hashedRefreshToken!\n  , last_login = CURRENT_TIMESTAMP\nFROM\n  public.users AS u\nWHERE\n  a.user_id = :userId!\n  AND u.id = a.user_id\n  AND u.status = 'ACTIVE'\nRETURNING\n  a.user_id AS id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users_authentication AS a
 * SET
 *   refresh_token_hash = :hashedRefreshToken!
 *   , last_login = CURRENT_TIMESTAMP
 * FROM
 *   public.users AS u
 * WHERE
 *   a.user_id = :userId!
 *   AND u.id = a.user_id
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   a.user_id AS id
 * ```
 */
export const authSetUserRefreshHashOnLogin = new PreparedQuery<IAuthSetUserRefreshHashOnLoginParams,IAuthSetUserRefreshHashOnLoginResult>(authSetUserRefreshHashOnLoginIR);


