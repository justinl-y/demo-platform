/** Types generated for queries found in "src/repositories/auth/types/get-user-with-refresh-token.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthGetUserWithRefreshToken' parameters type */
export interface IAuthGetUserWithRefreshTokenParams {
  userId?: string | null | void;
}

/** 'AuthGetUserWithRefreshToken' return type */
export interface IAuthGetUserWithRefreshTokenResult {
  id: string;
  token_refresh_hash: string;
}

/** 'AuthGetUserWithRefreshToken' query type */
export interface IAuthGetUserWithRefreshTokenQuery {
  params: IAuthGetUserWithRefreshTokenParams;
  result: IAuthGetUserWithRefreshTokenResult;
}

const authGetUserWithRefreshTokenIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":141,"b":147}]}],"statement":"                                                             \nSELECT\n  u.id\n  , u.token_refresh_hash\nFROM\n  public.users AS u\nWHERE\n  u.id = :userId\n  AND u.token_refresh_hash IS NOT NULL"};

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
export const authGetUserWithRefreshToken = new PreparedQuery<IAuthGetUserWithRefreshTokenParams,IAuthGetUserWithRefreshTokenResult>(authGetUserWithRefreshTokenIR);


