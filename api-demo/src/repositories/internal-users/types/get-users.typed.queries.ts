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

const internalUsersGetUsersIR: any = {"usedParamSet":{"status":true,"search":true,"order":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":240,"b":246}]},{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":293,"b":299},{"a":321,"b":327},{"a":352,"b":358}]},{"name":"order","required":true,"transform":{"type":"scalar"},"locs":[{"a":927,"b":933},{"a":1165,"b":1170}]},{"name":"sort","required":true,"transform":{"type":"scalar"},"locs":[{"a":959,"b":964},{"a":1195,"b":1199}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1497,"b":1503}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1515,"b":1522}]}],"statement":"                                                             \nWITH t_users AS (\n\tSELECT\n\t\tu.id AS user_id\n\t\t, u.email\n\t\t, u.full_name\n\t\t, u.known_as\n\t\t, u.status\n\t\t, u.created_at\n\tFROM\n\t\tinternal.users AS u\n\tWHERE\n\t\tCOALESCE(u.status = ANY(:status), TRUE)\n\t\tAND COALESCE(\n\t\t\tu.full_name ILIKE :search\n\t\t\tOR u.email ILIKE :search\n\t\t\tOR u.id::text ILIKE :search\n\t\t, TRUE)\n),\nt_ranked AS (\n\t-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON\n\t-- array below both order by this rank, so the result order is deterministic —\n\t-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.\n\tSELECT\n\t\t*\n\t\t, ROW_NUMBER() OVER (\n\t\t\t-- Direction can't be parameterized, so each direction is a separate gated\n\t\t\t-- term. created_at is rendered as fixed-width text (zero-padded, 6-digit\n\t\t\t-- microseconds) so it shares the text CASE and still sorts chronologically.\n\t\t\tORDER BY\n\t\t\t\tCASE WHEN :order! = 'DESC' THEN\n\t\t\t\t\tCASE :sort!\n\t\t\t\t\t\tWHEN 'name' THEN split_part(full_name, ' ', -1)\n\t\t\t\t\t\tWHEN 'email' THEN email\n\t\t\t\t\t\tWHEN 'created_at' THEN to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US')\n\t\t\t\t\tEND\n\t\t\t\tEND DESC\n\t\t\t\t, CASE WHEN :order = 'ASC' THEN\n\t\t\t\t\tCASE :sort\n\t\t\t\t\t\tWHEN 'name' THEN split_part(full_name, ' ', -1)\n\t\t\t\t\t\tWHEN 'email' THEN email\n\t\t\t\t\t\tWHEN 'created_at' THEN to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US')\n\t\t\t\t\tEND\n\t\t\t\tEND ASC\n\t\t\t\t, user_id ASC\n\t\t) AS ord\n\tFROM\n\t\tt_users\n),\nt_page AS (\n\tSELECT\n\t\t*\n\tFROM\n\t\tt_ranked\n\tORDER BY\n\t\tord\n\tLIMIT\n\t\t:limit!\n\tOFFSET\n\t\t:offset!\n)\nSELECT\n\tCOALESCE(\n\t\tjson_agg(\n\t\t\tjson_build_object(\n\t\t\t\t'user_id', tp.user_id\n\t\t\t\t, 'email', tp.email\n\t\t\t\t, 'full_name', tp.full_name\n\t\t\t\t, 'known_as', tp.known_as\n\t\t\t\t, 'status', tp.status\n\t\t\t)\n\t\t\tORDER BY tp.ord\n\t\t)\n\t, '[]'::json) AS users\n\t, COALESCE((SELECT COUNT(*) FROM t_users), 0)::int AS total\nFROM\n\tt_page AS tp"};

/**
 * Query generated from SQL:
 * ```
 *                                                              
 * WITH t_users AS (
 * 	SELECT
 * 		u.id AS user_id
 * 		, u.email
 * 		, u.full_name
 * 		, u.known_as
 * 		, u.status
 * 		, u.created_at
 * 	FROM
 * 		internal.users AS u
 * 	WHERE
 * 		COALESCE(u.status = ANY(:status), TRUE)
 * 		AND COALESCE(
 * 			u.full_name ILIKE :search
 * 			OR u.email ILIKE :search
 * 			OR u.id::text ILIKE :search
 * 		, TRUE)
 * ),
 * t_ranked AS (
 * 	-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON
 * 	-- array below both order by this rank, so the result order is deterministic —
 * 	-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.
 * 	SELECT
 * 		*
 * 		, ROW_NUMBER() OVER (
 * 			-- Direction can't be parameterized, so each direction is a separate gated
 * 			-- term. created_at is rendered as fixed-width text (zero-padded, 6-digit
 * 			-- microseconds) so it shares the text CASE and still sorts chronologically.
 * 			ORDER BY
 * 				CASE WHEN :order! = 'DESC' THEN
 * 					CASE :sort!
 * 						WHEN 'name' THEN split_part(full_name, ' ', -1)
 * 						WHEN 'email' THEN email
 * 						WHEN 'created_at' THEN to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US')
 * 					END
 * 				END DESC
 * 				, CASE WHEN :order = 'ASC' THEN
 * 					CASE :sort
 * 						WHEN 'name' THEN split_part(full_name, ' ', -1)
 * 						WHEN 'email' THEN email
 * 						WHEN 'created_at' THEN to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US')
 * 					END
 * 				END ASC
 * 				, user_id ASC
 * 		) AS ord
 * 	FROM
 * 		t_users
 * ),
 * t_page AS (
 * 	SELECT
 * 		*
 * 	FROM
 * 		t_ranked
 * 	ORDER BY
 * 		ord
 * 	LIMIT
 * 		:limit!
 * 	OFFSET
 * 		:offset!
 * )
 * SELECT
 * 	COALESCE(
 * 		json_agg(
 * 			json_build_object(
 * 				'user_id', tp.user_id
 * 				, 'email', tp.email
 * 				, 'full_name', tp.full_name
 * 				, 'known_as', tp.known_as
 * 				, 'status', tp.status
 * 			)
 * 			ORDER BY tp.ord
 * 		)
 * 	, '[]'::json) AS users
 * 	, COALESCE((SELECT COUNT(*) FROM t_users), 0)::int AS total
 * FROM
 * 	t_page AS tp
 * ```
 */
export const internalUsersGetUsers = new PreparedQuery<IInternalUsersGetUsersParams,IInternalUsersGetUsersResult>(internalUsersGetUsersIR);


