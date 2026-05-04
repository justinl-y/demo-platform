/** Types generated for queries found in "src/repositories/auth/types/get-user-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthGetUserByEmail' parameters type */
export interface IAuthGetUserByEmailParams {
  email?: string | null | void;
}

/** 'AuthGetUserByEmail' return type */
export interface IAuthGetUserByEmailResult {
  email: string;
  full_name: string;
  id: string;
  known_as: string | null;
  password_hash: string;
}

/** 'AuthGetUserByEmail' query type */
export interface IAuthGetUserByEmailQuery {
  params: IAuthGetUserByEmailParams;
  result: IAuthGetUserByEmailResult;
}

const authGetUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":182,"b":187}]}],"statement":"                                                             \nSELECT\n  u.id\n  , u.email\n  , u.full_name\n  , u.known_as\n  , u.password_hash\nFROM\n  public.users AS u\nWHERE\n  u.email = :email\n  and u.is_active = true"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 *   u.id
 *   , u.email
 *   , u.full_name
 *   , u.known_as
 *   , u.password_hash
 * FROM
 *   public.users AS u
 * WHERE
 *   u.email = :email
 *   and u.is_active = true
 * ```
 */
export const authGetUserByEmail = new PreparedQuery<IAuthGetUserByEmailParams,IAuthGetUserByEmailResult>(authGetUserByEmailIR);


