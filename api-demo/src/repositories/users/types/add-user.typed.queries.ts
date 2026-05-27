/** Types generated for queries found in "src/repositories/users/types/add-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'UsersAddUser' parameters type */
export interface IUsersAddUserParams {
  email: string;
  fullName: string;
  knownAs?: string | null | void;
}

/** 'UsersAddUser' return type */
export interface IUsersAddUserResult {
  email: string;
  full_name: string;
  known_as: string | null;
  status: user_status;
  user_id: string;
}

/** 'UsersAddUser' query type */
export interface IUsersAddUserQuery {
  params: IUsersAddUserParams;
  result: IUsersAddUserResult;
}

const usersAddUserIR: any = {"usedParamSet":{"email":true,"fullName":true,"knownAs":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":140,"b":146}]},{"name":"fullName","required":true,"transform":{"type":"scalar"},"locs":[{"a":152,"b":161}]},{"name":"knownAs","required":false,"transform":{"type":"scalar"},"locs":[{"a":167,"b":174}]}],"statement":"                                                             \nINSERT INTO public.users\n\t(\n\t\temail\n\t\t, full_name\n\t\t, known_as\n\t)\nVALUES\n\t(\n\t\t:email!\n\t\t, :fullName!\n\t\t, :knownAs\n\t)\nRETURNING\n\tid AS user_id\n\t, email\n\t, full_name\n\t, known_as\n\t, status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * INSERT INTO public.users
 * 	(
 * 		email
 * 		, full_name
 * 		, known_as
 * 	)
 * VALUES
 * 	(
 * 		:email!
 * 		, :fullName!
 * 		, :knownAs
 * 	)
 * RETURNING
 * 	id AS user_id
 * 	, email
 * 	, full_name
 * 	, known_as
 * 	, status
 * ```
 */
export const usersAddUser = new PreparedQuery<IUsersAddUserParams,IUsersAddUserResult>(usersAddUserIR);


