/** Types generated for queries found in "src/repositories/auth/types/get-user-refresh-hash.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthGetUserRefreshHash' parameters type */
export interface IAuthGetUserRefreshHashParams {
  userId?: string | null | void;
}

/** 'AuthGetUserRefreshHash' return type */
export interface IAuthGetUserRefreshHashResult {
  id: string;
  token_refresh_hash: string;
}

/** 'AuthGetUserRefreshHash' query type */
export interface IAuthGetUserRefreshHashQuery {
  params: IAuthGetUserRefreshHashParams;
  result: IAuthGetUserRefreshHashResult;
}

const authGetUserRefreshHashIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":141,"b":147}]}],"statement":"                                                             \nSELECT\n  u.id\n  , u.token_refresh_hash\nFROM\n  public.users AS u\nWHERE\n  u.id = :userId\n  AND u.token_refresh_hash IS NOT NULL\n  AND (u.activated_at IS NOT NULL\n    AND u.deactivated_at IS NULL)"};

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
 *   AND (u.activated_at IS NOT NULL
 *     AND u.deactivated_at IS NULL)
 * ```
 */
export const authGetUserRefreshHash = new PreparedQuery<IAuthGetUserRefreshHashParams,IAuthGetUserRefreshHashResult>(authGetUserRefreshHashIR);


