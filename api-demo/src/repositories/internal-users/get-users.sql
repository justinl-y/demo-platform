WITH t_users AS (
	SELECT
		u.id AS user_id
		, u.email
		, u.full_name
		, u.known_as
		, u.status
		, u.created_at
	FROM
		internal.users AS u
	WHERE
		COALESCE(u.status = ANY($status), TRUE)
		AND COALESCE(
			u.full_name ILIKE $search
			OR u.email ILIKE $search
			OR u.id::text ILIKE $search
		, TRUE)
),
t_ranked AS (
	-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON
	-- array below both order by this rank, so the result order is deterministic —
	-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.
	SELECT
		*
		, ROW_NUMBER() OVER (
			-- Direction can't be parameterized, so each direction is a separate gated
			-- term. created_at is rendered as fixed-width text (zero-padded, 6-digit
			-- microseconds) so it shares the text CASE and still sorts chronologically.
			ORDER BY
				CASE WHEN $order! = 'DESC' THEN
					CASE $sort!
						WHEN 'name' THEN split_part(full_name, ' ', -1)
						WHEN 'email' THEN email
						WHEN 'created_at' THEN to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US')
					END
				END DESC
				, CASE WHEN $order = 'ASC' THEN
					CASE $sort
						WHEN 'name' THEN split_part(full_name, ' ', -1)
						WHEN 'email' THEN email
						WHEN 'created_at' THEN to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.US')
					END
				END ASC
				, user_id ASC
		) AS ord
	FROM
		t_users
),
t_page AS (
	SELECT
		*
	FROM
		t_ranked
	ORDER BY
		ord
	LIMIT
		$limit!
	OFFSET
		$offset!
)
SELECT
	COALESCE(
		json_agg(
			json_build_object(
				'user_id', tp.user_id
				, 'email', tp.email
				, 'full_name', tp.full_name
				, 'known_as', tp.known_as
				, 'status', tp.status
			)
			ORDER BY tp.ord
		)
	, '[]'::json) AS users
	, COALESCE((SELECT COUNT(*) FROM t_users), 0)::int AS total
FROM
	t_page AS tp
;
