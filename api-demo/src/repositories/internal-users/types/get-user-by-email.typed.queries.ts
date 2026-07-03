/** Types generated for queries found in "src/repositories/internal-users/types/get-user-by-email.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InternalUsersGetUserByEmail' parameters type */
export interface IInternalUsersGetUserByEmailParams {
  email: string;
}

/** 'InternalUsersGetUserByEmail' return type */
export interface IInternalUsersGetUserByEmailResult {
  user_id: string;
}

/** 'InternalUsersGetUserByEmail' query type */
export interface IInternalUsersGetUserByEmailQuery {
  params: IInternalUsersGetUserByEmailParams;
  result: IInternalUsersGetUserByEmailResult;
}

const internalUsersGetUserByEmailIR: any = {"usedParamSet":{"email":true},"params":[{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":135}]}],"statement":"                                                             \nSELECT\n\tu.id AS user_id\nFROM\n\tinternal.users AS u\nWHERE\n\tu.email = :email!"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * SELECT
 * 	u.id AS user_id
 * FROM
 * 	internal.users AS u
 * WHERE
 * 	u.email = :email!
 * ```
 */
export const internalUsersGetUserByEmail = new PreparedQuery<IInternalUsersGetUserByEmailParams,IInternalUsersGetUserByEmailResult>(internalUsersGetUserByEmailIR);


