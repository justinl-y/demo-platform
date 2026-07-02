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
t_page AS (
	SELECT
		pg.*
		-- `ord` preserves the requested sort into the JSON array below: the inner
		-- subquery is ORDER BY-ed then LIMIT/OFFSET-ed, and ROW_NUMBER() OVER () numbers
		-- rows in that produced order (Postgres carries a subquery's ORDER BY into the
		-- window step), so json_agg(... ORDER BY tp.ord) re-emits rows in sort order.
		, ROW_NUMBER() OVER () AS ord
	FROM (
		SELECT
			*
		FROM
			t_permissions
		ORDER BY
			-- Direction can't be parameterized, so each direction is a separate gated term.
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
		LIMIT
			$limit!
		OFFSET
			$offset!
	) AS pg
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
