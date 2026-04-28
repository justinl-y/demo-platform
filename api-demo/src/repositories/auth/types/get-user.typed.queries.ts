/** Types generated for queries found in "src/routes/auth/post-login/types/get-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'AuthPostLoginGetUser' parameters type */
export interface IAuthPostLoginGetUserParams {
  email?: string | null | void;
}

/** 'AuthPostLoginGetUser' return type */
export interface IAuthPostLoginGetUserResult {
  email: string;
  full_name: string;
  id: string;
  known_as: string | null;
  password_hash: string;
}

/** 'AuthPostLoginGetUser' query type */
export interface IAuthPostLoginGetUserQuery {
  params: IAuthPostLoginGetUserParams;
  result: IAuthPostLoginGetUserResult;
}

const authPostLoginGetUserIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":182,"b":187}]}],"statement":"                                                             \nSELECT\n  u.id\n  , u.email\n  , u.full_name\n  , u.known_as\n  , u.password_hash\nFROM\n  public.users AS u\nWHERE\n  u.email = :email\n  and u.is_active = true"};

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
export const authPostLoginGetUser = new PreparedQuery<IAuthPostLoginGetUserParams,IAuthPostLoginGetUserResult>(authPostLoginGetUserIR);


