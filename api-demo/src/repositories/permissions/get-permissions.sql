WITH t_permissions AS (
	SELECT
	  p.id AS permission_id
	  , p.name
	  , p.description
		, COUNT(*) OVER () AS total
	FROM
	  internal.permissions AS p
	WHERE
		COALESCE(
			p.name ILIKE $search
			OR p.id::text ILIKE $search
		, TRUE)
	ORDER BY
		-- Direction can't be parameterized, so each direction is a separate gated term.
		CASE WHEN $order! = 'DESC' THEN
			CASE $sort!
				WHEN 'name' THEN p.name
			END
		END DESC
		, CASE WHEN $order = 'ASC' THEN
			CASE $sort
				WHEN 'name' THEN p.name
			END
		END ASC
		, p.id ASC
	LIMIT
		$limit!
	OFFSET
		$offset!
)
SELECT
	json_object_agg(
		tp.permission_id
		,json_build_object(
			'name', tp.name
			, 'description', tp.description
		)
	) AS permissions
	, COALESCE(MAX(tp.total), 0)::int AS total
FROM
	t_permissions AS tp
;
