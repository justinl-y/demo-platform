/** Types generated for queries found in "src/repositories/internal-users/types/get-users.typed.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_status = 'ACTIVE' | 'CREATED' | 'DEACTIVATED' | 'INVITED';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type NumberOrString = number | string;

export type user_statusArray = (user_status)[];

/** 'InternalUsersGetUsers' parameters type */
export interface IInternalUsersGetUsersParams {
  limit: NumberOrString;
  offset: NumberOrString;
  order: string;
  search?: string | null | void;
  sort: string;
  status?: user_statusArray | null | void;
}

/** 'InternalUsersGetUsers' return type */
export interface IInternalUsersGetUsersResult {
  total: number | null;
  users: Json | null;
}

/** 'InternalUsersGetUsers' query type */
export interface IInternalUsersGetUsersQuery {
  params: IInternalUsersGetUsersParams;
  result: IInternalUsersGetUsersResult;
}

const internalUsersGetUsersIR: any = {"usedParamSet":{"status":true,"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":258,"b":264}]},{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":312,"b":318},{"a":340,"b":346},{"a":371,"b":377}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":643,"b":649},{"a":873,"b":878}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":673,"b":678},{"a":901,"b":905}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1107,"b":1113}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1125,"b":1132}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t  u.id AS user_id\n\t  , u.email\n\t  , u.full_name\n\t  , u.known_as\n\t\t, u.status\n\t\t, COUNT(*) OVER () AS total\n\tFROM\n\t  internal.users AS u\n\tWHERE\n\t\tCOALESCE(u.status = ANY(:status), TRUE)\n\t  AND COALESCE(\n\t\t\tu.full_name ILIKE :search\n\t\t\tOR u.email ILIKE :search\n\t\t\tOR u.id::text ILIKE :search\n\t\t, TRUE)\n\tORDER BY\n\t\t-- Direction can't be parameterized, so each direction is a separate gated\n\t\t-- term. created_at is rendered as fixed-width text (zero-padded, 6-digit\n\t\t-- microseconds) so it shares the text CASE and still sorts chronologically.\n\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\tCASE :sort!\n\t\t\t\tWHEN 'name' THEN split_part(u.full_name, ' ', -1)\n\t\t\t\tWHEN 'email' THEN u.email\n\t\t\t\tWHEN 'created_at' THEN to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS.US')\n\t\t\tEND\n\t\tEND DESC\n\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\tCASE :sort\n\t\t\t\tWHEN 'name' THEN split_part(u.full_name, ' ', -1)\n\t\t\t\tWHEN 'email' THEN u.email\n\t\t\t\tWHEN 'created_at' THEN to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS.US')\n\t\t\tEND\n\t\tEND ASC\n\t\t, u.id ASC\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tjson_object_agg(\n\t\ttu.user_id\n\t\t,json_build_object(\n\t\t\t'email', tu.email\n\t\t\t, 'full_name', tu.full_name\n\t\t\t, 'known_as', tu.known_as\n\t\t\t, 'status', tu.status\n\t\t)\n\t) AS users\n\t, COALESCE(MAX(tu.total), 0)::int AS total\nFROM\n\tt_users AS tu"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_users AS (
 * 	SELECT
 * 	  u.id AS user_id
 * 	  , u.email
 * 	  , u.full_name
 * 	  , u.known_as
 * 		, u.status
 * 		, COUNT(*) OVER () AS total
 * 	FROM
 * 	  internal.users AS u
 * 	WHERE
 * 		COALESCE(u.status = ANY(:status), TRUE)
 * 	  AND COALESCE(
 * 			u.full_name ILIKE :search
 * 			OR u.email ILIKE :search
 * 			OR u.id::text ILIKE :search
 * 		, TRUE)
 * 	ORDER BY
 * 		-- Direction can't be parameterized, so each direction is a separate gated
 * 		-- term. created_at is rendered as fixed-width text (zero-padded, 6-digit
 * 		-- microseconds) so it shares the text CASE and still sorts chronologically.
 * 		CASE WHEN :order! = 'DESC' THEN
 * 			CASE :sort!
 * 				WHEN 'name' THEN split_part(u.full_name, ' ', -1)
 * 				WHEN 'email' THEN u.email
 * 				WHEN 'created_at' THEN to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS.US')
 * 			END
 * 		END DESC
 * 		, CASE WHEN :order = 'ASC' THEN
 * 			CASE :sort
 * 				WHEN 'name' THEN split_part(u.full_name, ' ', -1)
 * 				WHEN 'email' THEN u.email
 * 				WHEN 'created_at' THEN to_char(u.created_at, 'YYYY-MM-DD HH24:MI:SS.US')
 * 			END
 * 		END ASC
 * 		, u.id ASC
 * 	LIMIT
 * 		:limit!
 * 	OFFSET
 * 		:offset!
 * )
 * SELECT
 * 	json_object_agg(
 * 		tu.user_id
 * 		,json_build_object(
 * 			'email', tu.email
 * 			, 'full_name', tu.full_name
 * 			, 'known_as', tu.known_as
 * 			, 'status', tu.status
 * 		)
 * 	) AS users
 * 	, COALESCE(MAX(tu.total), 0)::int AS total
 * FROM
 * 	t_users AS tu
 * ```
 */
export const internalUsersGetUsers = new PreparedQuery<IInternalUsersGetUsersParams,IInternalUsersGetUsersResult>(internalUsersGetUsersIR);


