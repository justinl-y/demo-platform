/** Types generated for queries found in "src/repositories/users/types/get-user-by-status.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'UsersGetUserByStatus' parameters type */
export interface IUsersGetUserByStatusParams {
  status: user_status;
  userId: string;
}

/** 'UsersGetUserByStatus' return type */
export interface IUsersGetUserByStatusResult {
  id: string;
}

/** 'UsersGetUserByStatus' query type */
export interface IUsersGetUserByStatusQuery {
  params: IUsersGetUserByStatusParams;
  result: IUsersGetUserByStatusResult;
}

const usersGetUserByStatusIR: any = {"usedParamSet":{"userId":true,"status":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":123}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]}],"statement":"                                                             \nSELECT\n  u.id\nFROM\n  public.users AS u\nWHERE\n  u.id = :userId!\n  AND u.status = :status!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 * FROM
 *   public.users AS u
 * WHERE
 *   u.id = :userId!
 *   AND u.status = :status!
 * ```
 */
export const usersGetUserByStatus = new PreparedQuery<IUsersGetUserByStatusParams,IUsersGetUserByStatusResult>(usersGetUserByStatusIR);


