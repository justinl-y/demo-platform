WITH t_roles AS (
	SELECT
		r.id AS role_id
		, r.name
		, r.description
	FROM
		internal.roles AS r
	WHERE
		COALESCE(
			r.name ILIKE $search
			OR r.id::text ILIKE $search
		, TRUE)
),
t_page AS (
	SELECT
		rg.*
		-- `ord` preserves the requested sort into the JSON array below: the inner
		-- subquery is ORDER BY-ed then LIMIT/OFFSET-ed, and ROW_NUMBER() OVER () numbers
		-- rows in that produced order (Postgres carries a subquery's ORDER BY into the
		-- window step), so json_agg(... ORDER BY tp.ord) re-emits rows in sort order.
		, ROW_NUMBER() OVER () AS ord
	FROM (
		SELECT
			*
		FROM
			t_roles
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
			, role_id ASC
		LIMIT
			$limit!
		OFFSET
			$offset!
	) AS rg
)
SELECT
	COALESCE(
		json_agg(
			json_build_object(
				'role_id', tp.role_id
				, 'name', tp.name
				, 'description', tp.description
			)
			ORDER BY tp.ord
		)
	, '[]'::json) AS roles
	, COALESCE((SELECT COUNT(*) FROM t_roles), 0)::int AS total
FROM
	t_page AS tp
;
