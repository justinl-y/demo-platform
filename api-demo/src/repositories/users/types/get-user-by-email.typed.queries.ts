/** Types generated for queries found in "src/repositories/users/types/get-user-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersGetUserByEmail' parameters type */
export interface IUsersGetUserByEmailParams {
  email: string;
}

/** 'UsersGetUserByEmail' return type */
export interface IUsersGetUserByEmailResult {
  id: string;
}

/** 'UsersGetUserByEmail' query type */
export interface IUsersGetUserByEmailQuery {
  params: IUsersGetUserByEmailParams;
  result: IUsersGetUserByEmailResult;
}

const usersGetUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":112}]}],"statement":"                                                             \nSELECT\n\tid\nFROM public.users\nWHERE\n\temail = :email!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	id
 * FROM public.users
 * WHERE
 * 	email = :email!
 * ```
 */
export const usersGetUserByEmail = new PreparedQuery<IUsersGetUserByEmailParams,IUsersGetUserByEmailResult>(usersGetUserByEmailIR);


