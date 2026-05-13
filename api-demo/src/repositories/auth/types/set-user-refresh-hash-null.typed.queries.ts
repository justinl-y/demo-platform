/** Types generated for queries found in "src/repositories/auth/types/set-user-refresh-hash-null.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserRefreshHashNull' parameters type */
export interface IAuthSetUserRefreshHashNullParams {
  userId: string;
}

/** 'AuthSetUserRefreshHashNull' return type */
export interface IAuthSetUserRefreshHashNullResult {
  id: string;
}

/** 'AuthSetUserRefreshHashNull' query type */
export interface IAuthSetUserRefreshHashNullQuery {
  params: IAuthSetUserRefreshHashNullParams;
  result: IAuthSetUserRefreshHashNullResult;
}

const authSetUserRefreshHashNullIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":136}]}],"statement":"                                                             \nUPDATE\n  public.users\nSET\n  token_refresh_hash = NULL\nWHERE\n  id = :userId!\n  AND token_refresh_hash IS NOT NULL\nRETURNING\n  id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users
 * SET
 *   token_refresh_hash = NULL
 * WHERE
 *   id = :userId!
 *   AND token_refresh_hash IS NOT NULL
 * RETURNING
 *   id
 * ```
 */
export const authSetUserRefreshHashNull = new PreparedQuery<IAuthSetUserRefreshHashNullParams,IAuthSetUserRefreshHashNullResult>(authSetUserRefreshHashNullIR);


