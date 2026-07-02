/** Types generated for queries found in "src/repositories/internal-users/types/get-user-by-status.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

export type user_statusArray = (user_status)[];

/** 'InternalUsersGetUserByStatus' parameters type */
export interface IInternalUsersGetUserByStatusParams {
  status: user_statusArray;
  userId: string;
}

/** 'InternalUsersGetUserByStatus' return type */
export interface IInternalUsersGetUserByStatusResult {
  user_id: string;
}

/** 'InternalUsersGetUserByStatus' query type */
export interface IInternalUsersGetUserByStatusQuery {
  params: IInternalUsersGetUserByStatusParams;
  result: IInternalUsersGetUserByStatusResult;
}

const internalUsersGetUserByStatusIR: any = {"usedParamSet":{"userId":true,"status":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":136}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":159,"b":166}]}],"statement":"                                                             \nSELECT\n  u.id AS user_id\nFROM\n  internal.users AS u\nWHERE\n  u.id = :userId!\n  AND u.status = ANY(:status!)"};

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
export const internalUsersGetUserByStatus = new PreparedQuery<IInternalUsersGetUserByStatusParams,IInternalUsersGetUserByStatusResult>(internalUsersGetUserByStatusIR);


