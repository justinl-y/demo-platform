/** Types generated for queries found in "src/repositories/auth/types/set-user-refresh-hash-on-refresh.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthSetUserRefreshHashOnRefresh' parameters type */
export interface IAuthSetUserRefreshHashOnRefreshParams {
  newRefreshTokenHash: string;
  userId: string;
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

const authSetUserRefreshHashOnRefreshIR: any = {"usedParamSet":{"newRefreshTokenHash":true,"userId":true},"params":[{"name":"newRefreshTokenHash","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":151}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":198,"b":205}]}],"statement":"                                                             \nUPDATE\n  public.users_authentication AS a\nSET\n  refresh_token_hash = :newRefreshTokenHash!\nFROM\n  public.users AS u\nWHERE\n  a.user_id = :userId!\n  AND u.id = a.user_id\n  AND u.status = 'ACTIVE'\nRETURNING\n  a.user_id AS id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * UPDATE
 *   public.users_authentication AS a
 * SET
 *   refresh_token_hash = :newRefreshTokenHash!
 * FROM
 *   public.users AS u
 * WHERE
 *   a.user_id = :userId!
 *   AND u.id = a.user_id
 *   AND u.status = 'ACTIVE'
 * RETURNING
 *   a.user_id AS id
 * ```
 */
export const authSetUserRefreshHashOnRefresh = new PreparedQuery<IAuthSetUserRefreshHashOnRefreshParams,IAuthSetUserRefreshHashOnRefreshResult>(authSetUserRefreshHashOnRefreshIR);


