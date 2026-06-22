WITH t_roles AS (
	SELECT
	  r.id AS role_id
	  , r.name
	  , r.description
		, COUNT(*) OVER () AS total
	FROM
	  internal.roles AS r
	WHERE
	  COALESCE((r.id = $roleId), TRUE)
	ORDER BY
		r.name ASC
		, r.id ASC
	LIMIT
		$limit!
	OFFSET
		$offset!
)
SELECT
	json_object_agg(
		tr.role_id
		,json_build_object(
			'name', tr.name
			, 'description', tr.description
		)
	) AS roles
	, COALESCE(MAX(tr.total), 0)::int AS total
FROM
	t_roles AS tr
;
