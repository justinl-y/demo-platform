/** Types generated for queries found in "src/repositories/auth/types/get-user-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'AuthGetUserPermissions' parameters type */
export interface IAuthGetUserPermissionsParams {
  userId: string;
}

/** 'AuthGetUserPermissions' return type */
export interface IAuthGetUserPermissionsResult {
  permissions: stringArray | null;
}

/** 'AuthGetUserPermissions' query type */
export interface IAuthGetUserPermissionsQuery {
  params: IAuthGetUserPermissionsParams;
  result: IAuthGetUserPermissionsResult;
}

const authGetUserPermissionsIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":432,"b":439}]}],"statement":"                                                             \nSELECT\n  ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS permissions\nFROM\n  internal.users AS u\n  LEFT JOIN internal.users_roles AS ur ON ur.user_id = u.id\n  LEFT JOIN internal.roles AS r ON r.id = ur.role_id\n  LEFT JOIN internal.role_permissions AS rp ON rp.role_id = r.id\n  LEFT JOIN internal.permissions AS p ON p.id = rp.permission_id\nWHERE\n  u.id = :userId!\nGROUP BY\n  u.id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS permissions
 * FROM
 *   internal.users AS u
 *   LEFT JOIN internal.users_roles AS ur ON ur.user_id = u.id
 *   LEFT JOIN internal.roles AS r ON r.id = ur.role_id
 *   LEFT JOIN internal.role_permissions AS rp ON rp.role_id = r.id
 *   LEFT JOIN internal.permissions AS p ON p.id = rp.permission_id
 * WHERE
 *   u.id = :userId!
 * GROUP BY
 *   u.id
 * ```
 */
export const authGetUserPermissions = new PreparedQuery<IAuthGetUserPermissionsParams,IAuthGetUserPermissionsResult>(authGetUserPermissionsIR);


