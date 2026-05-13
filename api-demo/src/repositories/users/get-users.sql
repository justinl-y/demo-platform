WITH t_users AS (
	SELECT
	  u.id
	  , u.email
	  , u.full_name
	  , u.known_as
		, u.status
		, COUNT(*) OVER () AS total
	FROM
	  public.users AS u
	WHERE
		COALESCE(u.status = ANY($status), TRUE)
	  AND COALESCE((u.id = $userId), TRUE)
	ORDER BY
		split_part(u.full_name, ' ', -1) ASC
		, u.id ASC
	LIMIT
		$limit!
	OFFSET
		$offset!
)
SELECT
	json_object_agg(
		tu.id
		,json_build_object(
			'email', tu.email
			, 'full_name', tu.full_name
			, 'known_as', tu.known_as
			, 'status', tu.status
		)
	) AS users
	, COALESCE(MAX(tu.total), 0)::int AS total
FROM
	t_users AS tu
;
