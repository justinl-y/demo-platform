/** Types generated for queries found in "src/repositories/authentication/types/get-user-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'AuthenticationGetUserByEmail' parameters type */
export interface IAuthenticationGetUserByEmailParams {
  email: string;
}

/** 'AuthenticationGetUserByEmail' return type */
export interface IAuthenticationGetUserByEmailResult {
  email: string;
  full_name: string;
  known_as: string | null;
  password_hash: string | null;
  permissions: stringArray | null;
  user_id: string;
}

/** 'AuthenticationGetUserByEmail' query type */
export interface IAuthenticationGetUserByEmailQuery {
  params: IAuthenticationGetUserByEmailParams;
  result: IAuthenticationGetUserByEmailResult;
}

const authenticationGetUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":614,"b":620}]}],"statement":"                                                             \nSELECT\n  u.id AS user_id\n  , u.email\n  , u.full_name\n  , u.known_as\n  , a.password_hash\n  , COALESCE(ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}'::varchar[]) AS permissions\nFROM\n  internal.users AS u\n  INNER JOIN internal.users_authentication AS a ON a.user_id = u.id\n  LEFT JOIN internal.users_roles AS ur ON ur.user_id = u.id\n  LEFT JOIN internal.roles AS r ON r.id = ur.role_id\n  LEFT JOIN internal.roles_permissions AS rp ON rp.role_id = r.id\n  LEFT JOIN internal.permissions AS p ON p.id = rp.permission_id\nWHERE\n  u.email = :email!\n  AND u.status = 'ACTIVE'\nGROUP BY\n \tu.id\n  , u.email\n  , u.full_name\n  , u.known_as\n  , a.password_hash"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id AS user_id
 *   , u.email
 *   , u.full_name
 *   , u.known_as
 *   , a.password_hash
 *   , COALESCE(ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}'::varchar[]) AS permissions
 * FROM
 *   internal.users AS u
 *   INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
 *   LEFT JOIN internal.users_roles AS ur ON ur.user_id = u.id
 *   LEFT JOIN internal.roles AS r ON r.id = ur.role_id
 *   LEFT JOIN internal.roles_permissions AS rp ON rp.role_id = r.id
 *   LEFT JOIN internal.permissions AS p ON p.id = rp.permission_id
 * WHERE
 *   u.email = :email!
 *   AND u.status = 'ACTIVE'
 * GROUP BY
 *  	u.id
 *   , u.email
 *   , u.full_name
 *   , u.known_as
 *   , a.password_hash
 * ```
 */
export const authenticationGetUserByEmail = new PreparedQuery<IAuthenticationGetUserByEmailParams,IAuthenticationGetUserByEmailResult>(authenticationGetUserByEmailIR);


