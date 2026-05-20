/** Types generated for queries found in "src/repositories/auth/types/get-user-refresh-hash.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthGetUserRefreshHash' parameters type */
export interface IAuthGetUserRefreshHashParams {
  userId: string;
}

/** 'AuthGetUserRefreshHash' return type */
export interface IAuthGetUserRefreshHashResult {
  id: string;
  refresh_token_hash: string;
}

/** 'AuthGetUserRefreshHash' query type */
export interface IAuthGetUserRefreshHashQuery {
  params: IAuthGetUserRefreshHashParams;
  result: IAuthGetUserRefreshHashResult;
}

const authGetUserRefreshHashIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":207,"b":214}]}],"statement":"                                                             \nSELECT\n  u.id\n  , a.refresh_token_hash\nFROM\n  public.users AS u\n  INNER JOIN public.users_authentication AS a ON a.user_id = u.id\nWHERE\n  u.id = :userId!\n  AND a.refresh_token_hash IS NOT NULL\n  AND u.status = 'ACTIVE'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 *   , a.refresh_token_hash
 * FROM
 *   public.users AS u
 *   INNER JOIN public.users_authentication AS a ON a.user_id = u.id
 * WHERE
 *   u.id = :userId!
 *   AND a.refresh_token_hash IS NOT NULL
 *   AND u.status = 'ACTIVE'
 * ```
 */
export const authGetUserRefreshHash = new PreparedQuery<IAuthGetUserRefreshHashParams,IAuthGetUserRefreshHashResult>(authGetUserRefreshHashIR);


