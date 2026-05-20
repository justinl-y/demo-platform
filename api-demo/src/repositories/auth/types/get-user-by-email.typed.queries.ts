/** Types generated for queries found in "src/repositories/auth/types/get-user-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthGetUserByEmail' parameters type */
export interface IAuthGetUserByEmailParams {
  email: string;
}

/** 'AuthGetUserByEmail' return type */
export interface IAuthGetUserByEmailResult {
  email: string;
  full_name: string;
  id: string;
  known_as: string | null;
  password_hash: string | null;
}

/** 'AuthGetUserByEmail' query type */
export interface IAuthGetUserByEmailQuery {
  params: IAuthGetUserByEmailParams;
  result: IAuthGetUserByEmailResult;
}

const authGetUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":248,"b":254}]}],"statement":"                                                             \nSELECT\n  u.id\n  , u.email\n  , u.full_name\n  , u.known_as\n  , a.password_hash\nFROM\n  public.users AS u\n  INNER JOIN public.users_authentication AS a ON a.user_id = u.id\nWHERE\n  u.email = :email!\n  AND u.status = 'ACTIVE'"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 *   , u.email
 *   , u.full_name
 *   , u.known_as
 *   , a.password_hash
 * FROM
 *   public.users AS u
 *   INNER JOIN public.users_authentication AS a ON a.user_id = u.id
 * WHERE
 *   u.email = :email!
 *   AND u.status = 'ACTIVE'
 * ```
 */
export const authGetUserByEmail = new PreparedQuery<IAuthGetUserByEmailParams,IAuthGetUserByEmailResult>(authGetUserByEmailIR);


