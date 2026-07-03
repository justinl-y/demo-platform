/** Types generated for queries found in "src/repositories/internal-users/types/add-user.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

/** 'InternalUsersAddUser' parameters type */
export interface IInternalUsersAddUserParams {
  email: string;
  fullName: string;
  knownAs?: string | null | void;
}

/** 'InternalUsersAddUser' return type */
export interface IInternalUsersAddUserResult {
  email: string;
  full_name: string;
  known_as: string | null;
  status: user_status;
  user_id: string;
}

/** 'InternalUsersAddUser' query type */
export interface IInternalUsersAddUserQuery {
  params: IInternalUsersAddUserParams;
  result: IInternalUsersAddUserResult;
}

const internalUsersAddUserIR: any = {"usedParamSet":{"email":true,"fullName":true,"knownAs":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":148}]},{"name":"fullName","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":163}]},{"name":"knownAs","required":false,"transform":{"type":"scalar"},"locs":[{"a":169,"b":176}]}],"statement":"                                                             \nINSERT INTO internal.users\n\t(\n\t\temail\n\t\t, full_name\n\t\t, known_as\n\t)\nVALUES\n\t(\n\t\t:email!\n\t\t, :fullName!\n\t\t, :knownAs\n\t)\nRETURNING\n\tid AS user_id\n\t, email\n\t, full_name\n\t, known_as\n\t, status"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * INSERT INTO internal.users
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
export const internalUsersAddUser = new PreparedQuery<IInternalUsersAddUserParams,IInternalUsersAddUserResult>(internalUsersAddUserIR);


