/** Types generated for queries found in "src/routes/auth/post-refresh/types/get-user-with-refresh-token.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthPostRefreshGetUserWithRefreshToken' parameters type */
export interface IAuthPostRefreshGetUserWithRefreshTokenParams {
  userId?: string | null | void;
}

/** 'AuthPostRefreshGetUserWithRefreshToken' return type */
export interface IAuthPostRefreshGetUserWithRefreshTokenResult {
  id: string;
  token_refresh_hash: string;
}

/** 'AuthPostRefreshGetUserWithRefreshToken' query type */
export interface IAuthPostRefreshGetUserWithRefreshTokenQuery {
  params: IAuthPostRefreshGetUserWithRefreshTokenParams;
  result: IAuthPostRefreshGetUserWithRefreshTokenResult;
}

const authPostRefreshGetUserWithRefreshTokenIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":141,"b":147}]}],"statement":"                                                             \nSELECT\n  u.id\n  , u.token_refresh_hash\nFROM\n  public.users AS u\nWHERE\n  u.id = :userId\n  AND u.token_refresh_hash IS NOT NULL"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 *   , u.token_refresh_hash
 * FROM
 *   public.users AS u
 * WHERE
 *   u.id = :userId
 *   AND u.token_refresh_hash IS NOT NULL
 * ```
 */
export const authPostRefreshGetUserWithRefreshToken = new PreparedQuery<IAuthPostRefreshGetUserWithRefreshTokenParams,IAuthPostRefreshGetUserWithRefreshTokenResult>(authPostRefreshGetUserWithRefreshTokenIR);


