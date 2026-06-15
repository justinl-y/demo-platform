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

const authSetUserRefreshHashOnLoginIR: any = {"usedParamSet":{"hashedRefreshToken":true,"userId":true},"params":[{"name":"hashedRefreshToken","required":true,"transform":{"type":"scalar"},"locs":[{"a":133,"b":152}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":236,"b":243}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication AS a\nSET\n  refresh_token_hash = :hashedRefreshToken!\n  , last_login = CURRENT_TIMESTAMP\nFROM\n  internal.users AS u\nWHERE\n  a.user_id = :userId!\n  AND u.id = a.user_id\n  AND u.status = 'ACTIVE'\nRETURNING\n  a.user_id AS id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication AS a
 * SET
 *   refresh_token_hash = :hashedRefreshToken!
 *   , last_login = CURRENT_TIMESTAMP
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
export const authSetUserRefreshHashOnLogin = new PreparedQuery<IAuthSetUserRefreshHashOnLoginParams,IAuthSetUserRefreshHashOnLoginResult>(authSetUserRefreshHashOnLoginIR);


