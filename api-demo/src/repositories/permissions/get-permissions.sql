WITH t_permissions AS (
	SELECT
		p.id AS permission_id
		, p.name
		, p.description
	FROM
		internal.permissions AS p
	WHERE
		COALESCE(
			p.name ILIKE $search
			OR p.id::text ILIKE $search
		, TRUE)
),
t_ranked AS (
	-- Rank the filtered set once by the requested sort. The page (t_page) and the JSON
	-- array below both order by this rank, so the result order is deterministic —
	-- ROW_NUMBER's ORDER BY and json_agg's ORDER BY are both guaranteed by SQL.
	SELECT
		*
		, ROW_NUMBER() OVER (
			-- Direction can't be parameterized, so each direction is a separate gated term.
			ORDER BY
				CASE WHEN $order! = 'DESC' THEN
					CASE $sort!
						WHEN 'name' THEN name
					END
				END DESC
				, CASE WHEN $order = 'ASC' THEN
					CASE $sort
						WHEN 'name' THEN name
					END
				END ASC
				, permission_id ASC
		) AS ord
	FROM
		t_permissions
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
				'permission_id', tp.permission_id
				, 'name', tp.name
				, 'description', tp.description
			)
			ORDER BY tp.ord
		)
	, '[]'::json) AS permissions
	, COALESCE((SELECT COUNT(*) FROM t_permissions), 0)::int AS total
FROM
	t_page AS tp
;
