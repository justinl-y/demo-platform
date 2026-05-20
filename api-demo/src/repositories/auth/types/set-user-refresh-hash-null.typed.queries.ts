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

const authSetUserRefreshHashNullIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":156}]}],"statement":"                                                             \nUPDATE\n  public.users_authentication\nSET\n  refresh_token_hash = NULL\nWHERE\n  user_id = :userId!\n  AND refresh_token_hash IS NOT NULL\nRETURNING\n  user_id AS id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users_authentication
 * SET
 *   refresh_token_hash = NULL
 * WHERE
 *   user_id = :userId!
 *   AND refresh_token_hash IS NOT NULL
 * RETURNING
 *   user_id AS id
 * ```
 */
export const authSetUserRefreshHashNull = new PreparedQuery<IAuthSetUserRefreshHashNullParams,IAuthSetUserRefreshHashNullResult>(authSetUserRefreshHashNullIR);


