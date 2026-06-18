/** Types generated for queries found in "src/repositories/authentication/types/get-user-permissions.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'AuthenticationGetUserPermissions' parameters type */
export interface IAuthenticationGetUserPermissionsParams {
  userId: string;
}

/** 'AuthenticationGetUserPermissions' return type */
export interface IAuthenticationGetUserPermissionsResult {
  permissions: stringArray | null;
}

/** 'AuthenticationGetUserPermissions' query type */
export interface IAuthenticationGetUserPermissionsQuery {
  params: IAuthenticationGetUserPermissionsParams;
  result: IAuthenticationGetUserPermissionsResult;
}

const authenticationGetUserPermissionsIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":460,"b":467}]}],"statement":"                                                             \nSELECT\n  COALESCE(ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}'::varchar[]) AS permissions\nFROM\n  internal.users AS u\n  LEFT JOIN internal.users_roles AS ur ON ur.user_id = u.id\n  LEFT JOIN internal.roles AS r ON r.id = ur.role_id\n  LEFT JOIN internal.roles_permissions AS rp ON rp.role_id = r.id\n  LEFT JOIN internal.permissions AS p ON p.id = rp.permission_id\nWHERE\n  u.id = :userId!\nGROUP BY\n  u.id"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   COALESCE(ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}'::varchar[]) AS permissions
 * FROM
 *   internal.users AS u
 *   LEFT JOIN internal.users_roles AS ur ON ur.user_id = u.id
 *   LEFT JOIN internal.roles AS r ON r.id = ur.role_id
 *   LEFT JOIN internal.roles_permissions AS rp ON rp.role_id = r.id
 *   LEFT JOIN internal.permissions AS p ON p.id = rp.permission_id
 * WHERE
 *   u.id = :userId!
 * GROUP BY
 *   u.id
 * ```
 */
export const authenticationGetUserPermissions = new PreparedQuery<IAuthenticationGetUserPermissionsParams,IAuthenticationGetUserPermissionsResult>(authenticationGetUserPermissionsIR);


