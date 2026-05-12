/** Types generated for queries found in "src/repositories/users/types/get-created-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersGetCreatedUser' parameters type */
export interface IUsersGetCreatedUserParams {
  userId?: string | null | void;
}

/** 'UsersGetCreatedUser' return type */
export interface IUsersGetCreatedUserResult {
  id: string;
}

/** 'UsersGetCreatedUser' query type */
export interface IUsersGetCreatedUserQuery {
  params: IUsersGetCreatedUserParams;
  result: IUsersGetCreatedUserResult;
}

const usersGetCreatedUserIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":116,"b":122}]}],"statement":"                                                             \nSELECT\n  u.id\nFROM\n  public.users AS u\nWHERE\n  u.id = :userId\n  AND u.status = 'CREATED'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 * FROM
 *   public.users AS u
 * WHERE
 *   u.id = :userId
 *   AND u.status = 'CREATED'
 * ```
 */
export const usersGetCreatedUser = new PreparedQuery<IUsersGetCreatedUserParams,IUsersGetCreatedUserResult>(usersGetCreatedUserIR);


