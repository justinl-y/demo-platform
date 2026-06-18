/** Types generated for queries found in "src/repositories/authentication/types/set-user-refresh-hash-null.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthenticationSetUserRefreshHashNull' parameters type */
export interface IAuthenticationSetUserRefreshHashNullParams {
  userId: string;
}

/** 'AuthenticationSetUserRefreshHashNull' return type */
export interface IAuthenticationSetUserRefreshHashNullResult {
  id: string;
}

/** 'AuthenticationSetUserRefreshHashNull' query type */
export interface IAuthenticationSetUserRefreshHashNullQuery {
  params: IAuthenticationSetUserRefreshHashNullParams;
  result: IAuthenticationSetUserRefreshHashNullResult;
}

const authenticationSetUserRefreshHashNullIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":158}]}],"statement":"                                                             \nUPDATE\n  internal.users_authentication\nSET\n  refresh_token_hash = NULL\nWHERE\n  user_id = :userId!\n  AND refresh_token_hash IS NOT NULL\nRETURNING\n  user_id AS id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   internal.users_authentication
 * SET
 *   refresh_token_hash = NULL
 * WHERE
 *   user_id = :userId!
 *   AND refresh_token_hash IS NOT NULL
 * RETURNING
 *   user_id AS id
 * ```
 */
export const authenticationSetUserRefreshHashNull = new PreparedQuery<IAuthenticationSetUserRefreshHashNullParams,IAuthenticationSetUserRefreshHashNullResult>(authenticationSetUserRefreshHashNullIR);


