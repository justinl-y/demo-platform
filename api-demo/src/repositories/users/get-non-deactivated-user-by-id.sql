SELECT
	u.id AS user_id
FROM
	internal.users AS u
WHERE
	u.id = $userId!
	AND u.status <> 'DEACTIVATED'
;
