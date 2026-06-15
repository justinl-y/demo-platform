/** Types generated for queries found in "src/repositories/users/types/get-user-by-status.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

export type user_statusArray = (user_status)[];

/** 'UsersGetUserByStatus' parameters type */
export interface IUsersGetUserByStatusParams {
  status: user_statusArray;
  userId: string;
}

/** 'UsersGetUserByStatus' return type */
export interface IUsersGetUserByStatusResult {
  user_id: string;
}

/** 'UsersGetUserByStatus' query type */
export interface IUsersGetUserByStatusQuery {
  params: IUsersGetUserByStatusParams;
  result: IUsersGetUserByStatusResult;
}

const usersGetUserByStatusIR: any = {"usedParamSet":{"userId":true,"status":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":136}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":159,"b":166}]}],"statement":"                                                             \nSELECT\n  u.id AS user_id\nFROM\n  internal.users AS u\nWHERE\n  u.id = :userId!\n  AND u.status = ANY(:status!)"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id AS user_id
 * FROM
 *   internal.users AS u
 * WHERE
 *   u.id = :userId!
 *   AND u.status = ANY(:status!)
 * ```
 */
export const usersGetUserByStatus = new PreparedQuery<IUsersGetUserByStatusParams,IUsersGetUserByStatusResult>(usersGetUserByStatusIR);


