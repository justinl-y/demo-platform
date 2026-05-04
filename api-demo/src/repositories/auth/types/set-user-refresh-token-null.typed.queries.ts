/** Types generated for queries found in "src/repositories/auth/types/set-user-refresh-token-null.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserRefreshTokenNull' parameters type */
export interface IAuthSetUserRefreshTokenNullParams {
  userId?: string | null | void;
}

/** 'AuthSetUserRefreshTokenNull' return type */
export interface IAuthSetUserRefreshTokenNullResult {
  id: string;
}

/** 'AuthSetUserRefreshTokenNull' query type */
export interface IAuthSetUserRefreshTokenNullQuery {
  params: IAuthSetUserRefreshTokenNullParams;
  result: IAuthSetUserRefreshTokenNullResult;
}

const authSetUserRefreshTokenNullIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":129,"b":135}]}],"statement":"                                                             \nUPDATE\n  public.users\nSET\n  token_refresh_hash = NULL\nWHERE\n  id = :userId\n  AND token_refresh_hash IS NOT NULL\nRETURNING\n  id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users
 * SET
 *   token_refresh_hash = NULL
 * WHERE
 *   id = :userId
 *   AND token_refresh_hash IS NOT NULL
 * RETURNING
 *   id
 * ```
 */
export const authSetUserRefreshTokenNull = new PreparedQuery<IAuthSetUserRefreshTokenNullParams,IAuthSetUserRefreshTokenNullResult>(authSetUserRefreshTokenNullIR);


