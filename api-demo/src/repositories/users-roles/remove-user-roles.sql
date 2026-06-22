DELETE FROM
	internal.users_roles
WHERE
	user_id = $userId!
RETURNING
	id AS users_roles_id
;
