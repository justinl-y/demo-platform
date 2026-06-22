SELECT
	p.id AS permission_id
FROM
	internal.permissions AS p
WHERE
	p.name = $name!
;
