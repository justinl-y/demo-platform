/** Types generated for queries found in "src/repositories/users/types/get-user-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersGetUserByEmail' parameters type */
export interface IUsersGetUserByEmailParams {
  email: string;
}

/** 'UsersGetUserByEmail' return type */
export interface IUsersGetUserByEmailResult {
  user_id: string;
}

/** 'UsersGetUserByEmail' query type */
export interface IUsersGetUserByEmailQuery {
  params: IUsersGetUserByEmailParams;
  result: IUsersGetUserByEmailResult;
}

const usersGetUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":133}]}],"statement":"                                                             \nSELECT\n\tu.id AS user_id\nFROM\n\tpublic.users AS u\nWHERE\n\tu.email = :email!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	u.id AS user_id
 * FROM
 * 	public.users AS u
 * WHERE
 * 	u.email = :email!
 * ```
 */
export const usersGetUserByEmail = new PreparedQuery<IUsersGetUserByEmailParams,IUsersGetUserByEmailResult>(usersGetUserByEmailIR);


