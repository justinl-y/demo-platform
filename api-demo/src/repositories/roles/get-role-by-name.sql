SELECT
	r.id AS role_id
FROM
	internal.roles AS r
WHERE
	r.name = $name!
;
