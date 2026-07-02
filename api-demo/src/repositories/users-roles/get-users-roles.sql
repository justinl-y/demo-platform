WITH t_users AS (
	SELECT
		u.id AS user_id
		, u.email AS user_email
		, u.full_name AS user_full_name
	FROM
		internal.users AS u
	WHERE
		COALESCE((u.id = $userId), TRUE)
),
t_page AS (
	SELECT
		p.*
		, ROW_NUMBER() OVER () AS ord
	FROM (
		SELECT
			*
		FROM
			t_users
		ORDER BY
			split_part(user_full_name, ' ', -1) ASC
			, user_id ASC
		LIMIT
			$limit!
		OFFSET
			$offset!
	) AS p
)
SELECT
	COALESCE(
		json_agg(
			json_build_object(
				'user_id', tp.user_id
				, 'user_email', tp.user_email
				, 'user_full_name', tp.user_full_name
				, 'roles', COALESCE(ur.roles, '{}'::json)
			)
			ORDER BY tp.ord
		)
	, '[]'::json) AS users
	, COALESCE((SELECT COUNT(*) FROM t_users), 0)::int AS total
FROM
	t_page AS tp
	LEFT JOIN LATERAL (
		SELECT
			json_object_agg(
				r.id
				, json_build_object(
					'role_id', r.id
					, 'role_name', r.name
				)
				ORDER BY
					r.name ASC
			) AS roles
		FROM
			internal.users_roles AS ur
			INNER JOIN internal.roles AS r ON r.id = ur.role_id
		WHERE
			ur.user_id = tp.user_id
	) AS ur ON TRUE
;
