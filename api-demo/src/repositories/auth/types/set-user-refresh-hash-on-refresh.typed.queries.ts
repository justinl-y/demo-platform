/** Types generated for queries found in "src/repositories/auth/types/set-user-refresh-hash-on-refresh.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserRefreshHashOnRefresh' parameters type */
export interface IAuthSetUserRefreshHashOnRefreshParams {
  newTokenRefreshHash?: string | null | void;
  userId?: string | null | void;
}

/** 'AuthSetUserRefreshHashOnRefresh' return type */
export interface IAuthSetUserRefreshHashOnRefreshResult {
  id: string;
}

/** 'AuthSetUserRefreshHashOnRefresh' query type */
export interface IAuthSetUserRefreshHashOnRefreshQuery {
  params: IAuthSetUserRefreshHashOnRefreshParams;
  result: IAuthSetUserRefreshHashOnRefreshResult;
}

const authSetUserRefreshHashOnRefreshIR: any = {"usedParamSet":{"newTokenRefreshHash":true,"userId":true},"params":[{"name":"newTokenRefreshHash","required":false,"transform":{"type":"scalar"},"locs":[{"a":111,"b":130}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":145,"b":151}]}],"statement":"                                                             \nUPDATE\n  public.users\nSET\n  token_refresh_hash = :newTokenRefreshHash\nWHERE\n  id = :userId\n  AND status = 'ACTIVE'\nRETURNING\n  id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users
 * SET
 *   token_refresh_hash = :newTokenRefreshHash
 * WHERE
 *   id = :userId
 *   AND status = 'ACTIVE'
 * RETURNING
 *   id
 * ```
 */
export const authSetUserRefreshHashOnRefresh = new PreparedQuery<IAuthSetUserRefreshHashOnRefreshParams,IAuthSetUserRefreshHashOnRefreshResult>(authSetUserRefreshHashOnRefreshIR);


