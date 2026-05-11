/** Types generated for queries found in "src/repositories/users/types/get-count-users-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UsersGetCountUsersByEmail' parameters type */
export interface IUsersGetCountUsersByEmailParams {
  email?: string | null | void;
}

/** 'UsersGetCountUsersByEmail' return type */
export interface IUsersGetCountUsersByEmailResult {
  count_email: number | null;
}

/** 'UsersGetCountUsersByEmail' query type */
export interface IUsersGetCountUsersByEmailQuery {
  params: IUsersGetCountUsersByEmailParams;
  result: IUsersGetCountUsersByEmailResult;
}

const usersGetCountUsersByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":false,"transform":{"type":"scalar"},"locs":[{"a":147,"b":152}]}],"statement":"                                                             \nSELECT\n\tcount(u.email)::int AS count_email\nFROM \n\tpublic.users AS u\nWHERE\n\tu.email = :email"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	count(u.email)::int AS count_email
 * FROM 
 * 	public.users AS u
 * WHERE
 * 	u.email = :email
 * ```
 */
export const usersGetCountUsersByEmail = new PreparedQuery<IUsersGetCountUsersByEmailParams,IUsersGetCountUsersByEmailResult>(usersGetCountUsersByEmailIR);


